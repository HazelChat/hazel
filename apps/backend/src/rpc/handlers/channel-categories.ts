import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import { ChannelCategoryRpcs } from "@hazel/domain/rpc"
import { Effect } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { ChannelCategoryPolicy } from "../../policies/channel-category-policy"
import { ChannelCategoryRepo } from "../../repositories/channel-category-repo"

export const ChannelCategoryRpcLive = ChannelCategoryRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"channelCategory.create": ({ id, ...payload }) =>
				Effect.gen(function* () {
					// Check authorization first
					yield* ChannelCategoryPolicy.canCreate(payload.organizationId)

					return yield* db.transaction(
						Effect.gen(function* () {
							// Use client-provided id for optimistic updates, or let DB generate one
							const insertData = id
								? { id, ...payload, deletedAt: null }
								: { ...payload, deletedAt: null }

							const createdCategory = yield* ChannelCategoryRepo.insert(
								insertData as typeof payload & { deletedAt: null },
							).pipe(Effect.map((res) => res[0]!), withSystemActor)

							const txid = yield* generateTransactionId()

							return {
								data: createdCategory,
								transactionId: txid,
							}
						}),
					)
				}).pipe(withRemapDbErrors("ChannelCategory", "create")),

			"channelCategory.update": ({ id, ...payload }) =>
				Effect.gen(function* () {
					// Check authorization first
					yield* ChannelCategoryPolicy.canUpdate(id)

					return yield* db.transaction(
						Effect.gen(function* () {
							const updatedCategory = yield* ChannelCategoryRepo.update({
								id,
								...payload,
							}).pipe(withSystemActor)

							const txid = yield* generateTransactionId()

							return {
								data: updatedCategory,
								transactionId: txid,
							}
						}),
					)
				}).pipe(withRemapDbErrors("ChannelCategory", "update")),

			"channelCategory.delete": ({ id }) =>
				Effect.gen(function* () {
					// Check authorization first
					yield* ChannelCategoryPolicy.canDelete(id)

					return yield* db.transaction(
						Effect.gen(function* () {
							// Soft delete by setting deletedAt
							yield* ChannelCategoryRepo.update({
								id,
								deletedAt: new Date(),
							}).pipe(withSystemActor)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
				}).pipe(withRemapDbErrors("ChannelCategory", "delete")),

			"channelCategory.list": ({ organizationId }) =>
				Effect.gen(function* () {
					// Check authorization first
					yield* ChannelCategoryPolicy.canList(organizationId)

					const categories = yield* ChannelCategoryRepo.findByOrganizationId(organizationId).pipe(
						withSystemActor,
					)

					return { categories }
				}).pipe(withRemapDbErrors("ChannelCategory", "select")),
		}
	}),
)
