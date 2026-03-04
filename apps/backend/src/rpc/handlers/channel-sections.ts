import { ChannelRepo, ChannelSectionRepo } from "@hazel/backend-core"
import { Database, schema } from "@hazel/db"
import { ErrorUtils, withRemapDbErrors } from "@hazel/domain"
import { ChannelNotFoundError, ChannelSectionNotFoundError, ChannelSectionRpcs } from "@hazel/domain/rpc"
import { and, eq, inArray, sql } from "drizzle-orm"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { transactionAwareExecute } from "../../lib/transaction-aware-execute"
import { withAnnotatedScope } from "../../lib/policy-utils"
import { ChannelSectionPolicy } from "../../policies/channel-section-policy"
import { OrgResolver } from "../../services/org-resolver"

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
								const maxOrderResult = yield* transactionAwareExecute((client) =>
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

								order = (maxOrderResult[0]?.maxOrder ?? -1) + 1
							}

							// Use client-provided id for optimistic updates, or let DB generate one
							const insertData = id
								? { id, ...payload, order, deletedAt: null }
								: { ...payload, order, deletedAt: null }

							yield* ChannelSectionPolicy.canCreate(payload.organizationId)
							const createdSection = yield* ChannelSectionRepo.insert(
								insertData as typeof payload & { order: number; deletedAt: null },
							).pipe(Effect.map((res) => res[0]!))

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
							yield* ChannelSectionPolicy.canUpdate(id)
							const updatedSection = yield* ChannelSectionRepo.update({
								id,
								...payload,
							})

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
							yield* ChannelSectionPolicy.canDelete(id)
							// First, move all channels in this section back to default (sectionId = null)
							const section = yield* ChannelSectionRepo.findById(id)

							if (Option.isNone(section)) {
								return yield* Effect.fail(new ChannelSectionNotFoundError({ sectionId: id }))
							}

							// Update all channels in this section to have null sectionId
							yield* transactionAwareExecute((client) =>
								client
									.update(schema.channelsTable)
									.set({ sectionId: null })
									.where(eq(schema.channelsTable.sectionId, id)),
							)

							// Delete the section
							yield* ChannelSectionRepo.deleteById(id)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("ChannelSection", "delete")),

			"channelSection.reorder": ({ organizationId, sectionIds }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* ChannelSectionPolicy.canReorder(organizationId)
							yield* transactionAwareExecute((client) =>
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
					.pipe(withRemapDbErrors("ChannelSection", "update")),

			"channelSection.moveChannel": ({ channelId, sectionId }) =>
				db
					.transaction(
						Effect.gen(function* () {
							// Get channel first to know its organization
							const channel = yield* ChannelRepo.findById(channelId)
							if (Option.isNone(channel)) {
								return yield* Effect.fail(new ChannelNotFoundError({ channelId }))
							}

							// Validate target section exists and belongs to same org
							if (sectionId !== null) {
								const section = yield* ChannelSectionRepo.findById(sectionId)
								if (Option.isNone(section)) {
									return yield* Effect.fail(new ChannelSectionNotFoundError({ sectionId }))
								}
								if (section.value.organizationId !== channel.value.organizationId) {
									return yield* Effect.fail(new ChannelSectionNotFoundError({ sectionId }))
								}
							}

							if (sectionId !== null) {
								yield* ChannelSectionPolicy.canUpdate(sectionId)
							} else {
								yield* ErrorUtils.refailUnauthorized(
									"ChannelSection",
									"moveChannel",
								)(
									withAnnotatedScope((scope) =>
										OrgResolver.requireAdminOrOwner(
											channel.value.organizationId,
											scope,
											"ChannelSection",
											"moveChannel",
										),
									),
								)
							}
							// Update the channel's sectionId
							yield* ChannelRepo.update({
								id: channelId,
								sectionId,
							})

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("Channel", "update")),
		}
	}),
)
