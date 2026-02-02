import { ChannelRepo, ChannelSectionRepo } from "@hazel/backend-core"
import { Database, schema } from "@hazel/db"
import { policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import { ChannelNotFoundError, ChannelSectionNotFoundError, ChannelSectionRpcs } from "@hazel/domain/rpc"
import { and, eq, inArray, sql } from "drizzle-orm"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { ChannelPolicy } from "../../policies/channel-policy"
import { ChannelSectionPolicy } from "../../policies/channel-section-policy"

export const ChannelSectionRpcLive = ChannelSectionRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"channelSection.create": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							// Calculate next order value if not provided or is 0
							let order = payload.order
							if (order === 0) {
								const maxOrderResult = yield* db
									.execute((client) =>
										client
											.select({
												maxOrder: sql<number>`COALESCE(MAX(${schema.channelSectionsTable.order}), -1)`,
											})
											.from(schema.channelSectionsTable)
											.where(
												eq(
													schema.channelSectionsTable.organizationId,
													payload.organizationId,
												),
											),
									)
									.pipe(withSystemActor)

								order = (maxOrderResult[0]?.maxOrder ?? -1) + 1
							}

							// Use client-provided id for optimistic updates, or let DB generate one
							const insertData = id
								? { id, ...payload, order, deletedAt: null }
								: { ...payload, order, deletedAt: null }

							const createdSection = yield* ChannelSectionRepo.insert(
								insertData as typeof payload & { order: number; deletedAt: null },
							).pipe(
								Effect.map((res) => res[0]!),
								policyUse(ChannelSectionPolicy.canCreate(payload.organizationId)),
							)

							const txid = yield* generateTransactionId()

							return {
								data: createdSection,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("ChannelSection", "create")),

			"channelSection.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const updatedSection = yield* ChannelSectionRepo.update({
								id,
								...payload,
							}).pipe(policyUse(ChannelSectionPolicy.canUpdate(id)))

							const txid = yield* generateTransactionId()

							return {
								data: updatedSection,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("ChannelSection", "update")),

			"channelSection.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							// First, move all channels in this section back to default (sectionId = null)
							const section = yield* ChannelSectionRepo.findById(id).pipe(withSystemActor)

							if (Option.isNone(section)) {
								return yield* Effect.fail(new ChannelSectionNotFoundError({ sectionId: id }))
							}

							// Update all channels in this section to have null sectionId
							yield* db
								.execute((client) =>
									client
										.update(schema.channelsTable)
										.set({ sectionId: null })
										.where(eq(schema.channelsTable.sectionId, id)),
								)
								.pipe(withSystemActor)

							// Delete the section
							yield* ChannelSectionRepo.deleteById(id)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(
						policyUse(ChannelSectionPolicy.canDelete(id)),
						withRemapDbErrors("ChannelSection", "delete"),
					),

			"channelSection.reorder": ({ organizationId, sectionIds }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* db.execute((client) =>
								client
									.update(schema.channelSectionsTable)
									.set({
										order: sql`CASE id ${sql.join(
											sectionIds.map((id, index) => sql`WHEN ${id} THEN ${index}`),
											sql` `,
										)} END`,
									})
									.where(
										and(
											inArray(schema.channelSectionsTable.id, sectionIds),
											eq(schema.channelSectionsTable.organizationId, organizationId),
										),
									),
							)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(
						policyUse(ChannelSectionPolicy.canReorder(organizationId)),
						withRemapDbErrors("ChannelSection", "update"),
					),

			"channelSection.moveChannel": ({ channelId, sectionId }) =>
				db
					.transaction(
						Effect.gen(function* () {
							// Get channel first to know its organization
							const channel = yield* ChannelRepo.findById(channelId).pipe(withSystemActor)
							if (Option.isNone(channel)) {
								return yield* Effect.fail(new ChannelNotFoundError({ channelId }))
							}

							// Validate target section exists and belongs to same org
							if (sectionId !== null) {
								const section =
									yield* ChannelSectionRepo.findById(sectionId).pipe(withSystemActor)
								if (Option.isNone(section)) {
									return yield* Effect.fail(new ChannelSectionNotFoundError({ sectionId }))
								}
								if (section.value.organizationId !== channel.value.organizationId) {
									return yield* Effect.fail(new ChannelSectionNotFoundError({ sectionId }))
								}
							}

							// Update the channel's sectionId
							yield* ChannelRepo.update({
								id: channelId,
								sectionId,
							}).pipe(policyUse(ChannelPolicy.canUpdate(channelId)))

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("Channel", "update")),
		}
	}),
)
