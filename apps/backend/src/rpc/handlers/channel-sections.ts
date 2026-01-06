import { Database, schema } from "@hazel/db"
import { policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import { ChannelSectionNotFoundError, ChannelSectionRpcs } from "@hazel/domain/rpc"
import { eq } from "drizzle-orm"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { ChannelPolicy } from "../../policies/channel-policy"
import { ChannelSectionPolicy } from "../../policies/channel-section-policy"
import { ChannelRepo } from "../../repositories/channel-repo"
import { ChannelSectionRepo } from "../../repositories/channel-section-repo"

export const ChannelSectionRpcLive = ChannelSectionRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"channelSection.create": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							// Use client-provided id for optimistic updates, or let DB generate one
							const insertData = id
								? { id, ...payload, deletedAt: null }
								: { ...payload, deletedAt: null }

							const createdSection = yield* ChannelSectionRepo.insert(
								insertData as typeof payload & { deletedAt: null },
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
							// Update order for each section
							for (let i = 0; i < sectionIds.length; i++) {
								const sectionId = sectionIds[i]!
								yield* db
									.execute((client) =>
										client
											.update(schema.channelSectionsTable)
											.set({ order: i })
											.where(eq(schema.channelSectionsTable.id, sectionId)),
									)
									.pipe(withSystemActor)
							}

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(
						policyUse(ChannelSectionPolicy.canCreate(organizationId)),
						withRemapDbErrors("ChannelSection", "update"),
					),

			"channelSection.moveChannel": ({ channelId, sectionId }) =>
				db
					.transaction(
						Effect.gen(function* () {
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
