import { CustomEmojiRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import { CustomEmojiNameConflictError, CustomEmojiNotFoundError, CustomEmojiRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { CustomEmojiPolicy } from "../../policies/custom-emoji-policy"

export const CustomEmojiRpcLive = CustomEmojiRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"customEmoji.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							// Check name uniqueness (system actor since we check canCreate below)
							const existing = yield* CustomEmojiRepo.findByOrgAndName(
								payload.organizationId,
								payload.name,
							).pipe(withSystemActor)
							if (Option.isSome(existing)) {
								return yield* Effect.fail(
									new CustomEmojiNameConflictError({
										name: payload.name,
										organizationId: payload.organizationId,
									}),
								)
							}

							const created = yield* CustomEmojiRepo.insert({
								organizationId: payload.organizationId,
								name: payload.name,
								imageUrl: payload.imageUrl,
								createdBy: user.id,
							}).pipe(
								Effect.map((res) => res[0]!),
								policyUse(CustomEmojiPolicy.canCreate(payload.organizationId)),
							)

							const txid = yield* generateTransactionId()

							return {
								data: created,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("CustomEmoji", "create")),

			"customEmoji.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							// Check if emoji exists (system actor since we check canUpdate below)
							const existing = yield* CustomEmojiRepo.findById(id).pipe(withSystemActor)
							if (Option.isNone(existing)) {
								return yield* Effect.fail(new CustomEmojiNotFoundError({ customEmojiId: id }))
							}

							// Check name uniqueness if renaming
							if (payload.name !== undefined) {
								const nameConflict = yield* CustomEmojiRepo.findByOrgAndName(
									existing.value.organizationId,
									payload.name,
								).pipe(withSystemActor)
								if (Option.isSome(nameConflict) && nameConflict.value.id !== id) {
									return yield* Effect.fail(
										new CustomEmojiNameConflictError({
											name: payload.name,
											organizationId: existing.value.organizationId,
										}),
									)
								}
							}

							const updated = yield* CustomEmojiRepo.update({
								id,
								...payload,
							}).pipe(policyUse(CustomEmojiPolicy.canUpdate(id)))

							const txid = yield* generateTransactionId()

							return {
								data: updated,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("CustomEmoji", "update")),

			"customEmoji.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const existing = yield* CustomEmojiRepo.softDelete(id).pipe(
								policyUse(CustomEmojiPolicy.canDelete(id)),
							)

							if (Option.isNone(existing)) {
								return yield* Effect.fail(new CustomEmojiNotFoundError({ customEmojiId: id }))
							}

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("CustomEmoji", "delete")),
		}
	}),
)
