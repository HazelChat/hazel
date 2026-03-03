import { CustomEmojiRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, withRemapDbErrors } from "@hazel/domain"
import {
	CustomEmojiDeletedExistsError,
	CustomEmojiNameConflictError,
	CustomEmojiNotFoundError,
	CustomEmojiRpcs,
} from "@hazel/domain/rpc"
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

							// Check name uniqueness
							const existing = yield* CustomEmojiRepo.findByOrgAndName(
								payload.organizationId,
								payload.name,
							)
							if (Option.isSome(existing)) {
								return yield* Effect.fail(
									new CustomEmojiNameConflictError({
										name: payload.name,
										organizationId: payload.organizationId,
									}),
								)
							}

							// Check if a soft-deleted emoji with same name exists
							const deleted = yield* CustomEmojiRepo.findDeletedByOrgAndName(
								payload.organizationId,
								payload.name,
							)
							if (Option.isSome(deleted)) {
								return yield* Effect.fail(
									new CustomEmojiDeletedExistsError({
										customEmojiId: deleted.value.id,
										name: deleted.value.name,
										imageUrl: deleted.value.imageUrl,
										organizationId: payload.organizationId,
									}),
								)
							}

							yield* CustomEmojiPolicy.canCreate(payload.organizationId)
							const created = yield* CustomEmojiRepo.insert({
								organizationId: payload.organizationId,
								name: payload.name,
								imageUrl: payload.imageUrl,
								createdBy: user.id,
							}).pipe(
								Effect.map((res) => res[0]!),
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
							// Check if emoji exists
							const existing = yield* CustomEmojiRepo.findById(id)
							if (Option.isNone(existing)) {
								return yield* Effect.fail(new CustomEmojiNotFoundError({ customEmojiId: id }))
							}

							// Check name uniqueness if renaming
							if (payload.name !== undefined) {
								const nameConflict = yield* CustomEmojiRepo.findByOrgAndName(
									existing.value.organizationId,
									payload.name,
								)
								if (Option.isSome(nameConflict) && nameConflict.value.id !== id) {
									return yield* Effect.fail(
										new CustomEmojiNameConflictError({
											name: payload.name,
											organizationId: existing.value.organizationId,
										}),
									)
								}
							}

							yield* CustomEmojiPolicy.canUpdate(id)
							const updated = yield* CustomEmojiRepo.update({
								id,
								...payload,
							})

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
							// Check existence first so missing IDs map to NotFound (not Unauthorized).
							const existing = yield* CustomEmojiRepo.findById(id)
							if (Option.isNone(existing) || existing.value.deletedAt !== null) {
								return yield* Effect.fail(new CustomEmojiNotFoundError({ customEmojiId: id }))
							}

							yield* CustomEmojiPolicy.canDelete(id)
							const deleted = yield* CustomEmojiRepo.softDelete(id)

							if (Option.isNone(deleted)) {
								return yield* Effect.fail(new CustomEmojiNotFoundError({ customEmojiId: id }))
							}

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("CustomEmoji", "delete")),

			"customEmoji.restore": ({ id, imageUrl }) =>
				db
					.transaction(
						Effect.gen(function* () {
							// Look up the deleted emoji first
							const existing = yield* CustomEmojiRepo.findById(id)
							if (Option.isNone(existing) || existing.value.deletedAt === null) {
								return yield* Effect.fail(new CustomEmojiNotFoundError({ customEmojiId: id }))
							}

							// Check that no active emoji with the same name exists
							const nameConflict = yield* CustomEmojiRepo.findByOrgAndName(
								existing.value.organizationId,
								existing.value.name,
							)
							if (Option.isSome(nameConflict)) {
								return yield* Effect.fail(
									new CustomEmojiNameConflictError({
										name: existing.value.name,
										organizationId: existing.value.organizationId,
									}),
								)
							}

							yield* CustomEmojiPolicy.canCreate(existing.value.organizationId)
							const restored = yield* CustomEmojiRepo.restore(id, imageUrl)

							if (Option.isNone(restored)) {
								return yield* Effect.fail(new CustomEmojiNotFoundError({ customEmojiId: id }))
							}

							const txid = yield* generateTransactionId()

							return {
								data: restored.value,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("CustomEmoji", "update")),
		}
	}),
)
