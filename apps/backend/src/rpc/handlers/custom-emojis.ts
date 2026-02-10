import { CustomEmojiRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
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

							// Check if a soft-deleted emoji with same name exists
							const deleted = yield* CustomEmojiRepo.findDeletedByOrgAndName(
								payload.organizationId,
								payload.name,
							).pipe(withSystemActor)
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
							// Check existence first so missing IDs map to NotFound (not Unauthorized).
							const existing = yield* CustomEmojiRepo.findById(id).pipe(withSystemActor)
							if (Option.isNone(existing) || existing.value.deletedAt !== null) {
								return yield* Effect.fail(new CustomEmojiNotFoundError({ customEmojiId: id }))
							}

							const deleted = yield* CustomEmojiRepo.softDelete(id).pipe(
								policyUse(CustomEmojiPolicy.canDelete(id)),
							)

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
							// Look up the deleted emoji first (system actor since we check canCreate below)
							const existing = yield* CustomEmojiRepo.findById(id).pipe(withSystemActor)
							if (Option.isNone(existing) || existing.value.deletedAt === null) {
								return yield* Effect.fail(new CustomEmojiNotFoundError({ customEmojiId: id }))
							}

							// Check that no active emoji with the same name exists
							const nameConflict = yield* CustomEmojiRepo.findByOrgAndName(
								existing.value.organizationId,
								existing.value.name,
							).pipe(withSystemActor)
							if (Option.isSome(nameConflict)) {
								return yield* Effect.fail(
									new CustomEmojiNameConflictError({
										name: existing.value.name,
										organizationId: existing.value.organizationId,
									}),
								)
							}

							const restored = yield* CustomEmojiRepo.restore(id, imageUrl).pipe(
								policyUse(CustomEmojiPolicy.canCreate(existing.value.organizationId)),
							)

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
