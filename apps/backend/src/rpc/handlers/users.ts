import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors } from "@hazel/effect-lib"
import { Effect } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { UserPolicy } from "../../policies/user-policy"
import { UserRepo } from "../../repositories/user-repo"
import { UserRpcs } from "../groups/users"

export const UserRpcLive = UserRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"user.me": () => CurrentUser.Context,

			"user.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const updatedUser = yield* UserRepo.update({
								id,
								...payload,
							}).pipe(policyUse(UserPolicy.canUpdate(id)))

							const txid = yield* generateTransactionId()

							return {
								data: updatedUser,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("User", "update")),

			"user.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* UserRepo.deleteById(id).pipe(policyUse(UserPolicy.canDelete(id)))

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("User", "delete")),
		}
	}),
)
