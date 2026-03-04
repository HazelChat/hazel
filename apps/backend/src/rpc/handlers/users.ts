import { UserRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, InternalServerError, withRemapDbErrors } from "@hazel/domain"
import { UserNotFoundError, UserRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { UserPolicy } from "../../policies/user-policy"
import { WorkOSAuth as WorkOS } from "../../services/workos-auth"

export const UserRpcLive = UserRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database
		const workos = yield* WorkOS

		return {
			"user.me": () => CurrentUser.Context,

			"user.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* UserPolicy.canUpdate(id)
							const updatedUser = yield* UserRepo.update({
								id,
								...payload,
							})

							yield* workos
								.call((client) =>
									client.userManagement.updateUser({
										userId: updatedUser.externalId,
										firstName: payload.firstName,
										lastName: payload.lastName,
									}),
								)
								.pipe(
									Effect.mapError(
										(error) =>
											new InternalServerError({
												message: "Failed to update user in WorkOS",
												detail: String(error.cause),
												cause: String(error),
											}),
									),
								)

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
							yield* UserPolicy.canRead(id)
							const userOption = yield* UserRepo.findById(id)

							const user = yield* Option.match(userOption, {
								onNone: () => Effect.fail(new UserNotFoundError({ userId: id })),
								onSome: (user) => Effect.succeed(user),
							})

							yield* UserPolicy.canDelete(id)
							yield* UserRepo.deleteById(id)

							yield* workos
								.call((client) => client.userManagement.deleteUser(user.externalId))
								.pipe(
									Effect.mapError(
										(error) =>
											new InternalServerError({
												message: "Failed to delete user in WorkOS",
												detail: String(error.cause),
												cause: String(error),
											}),
									),
								)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("User", "delete")),

			"user.finalizeOnboarding": () =>
				db
					.transaction(
						Effect.gen(function* () {
							const currentUser = yield* CurrentUser.Context

							// Update the current user's isOnboarded flag
							yield* UserPolicy.canUpdate(currentUser.id)
							const updatedUser = yield* UserRepo.update({
								id: currentUser.id,
								isOnboarded: true,
							})

							const txid = yield* generateTransactionId()

							return {
								data: updatedUser,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("User", "update")),

			"user.resetAvatar": () =>
				db
					.transaction(
						Effect.gen(function* () {
							const currentUser = yield* CurrentUser.Context

							// Fetch user from database to get externalId
							yield* UserPolicy.canRead(currentUser.id)
							const userOption = yield* UserRepo.findById(currentUser.id)

							const user = yield* Option.match(userOption, {
								onNone: () =>
									Effect.fail(
										new InternalServerError({
											message: "User not found",
											detail: `User ${currentUser.id} not found in database`,
										}),
									),
								onSome: (user) => Effect.succeed(user),
							})

							// Fetch user from WorkOS to get their original profile picture
							const workosUser = yield* workos
								.call((client) => client.userManagement.getUser(user.externalId))
								.pipe(
									Effect.mapError(
										(error) =>
											new InternalServerError({
												message: "Failed to fetch user from WorkOS",
												detail: String(error.cause),
												cause: String(error),
											}),
									),
								)

							// Use WorkOS profile picture, otherwise clear avatar
							const avatarUrl = workosUser.profilePictureUrl?.trim()
								? workosUser.profilePictureUrl
								: null

							// Update user's avatar in our database
							yield* UserPolicy.canUpdate(currentUser.id)
							const updatedUser = yield* UserRepo.update({
								id: currentUser.id,
								avatarUrl,
							})

							const txid = yield* generateTransactionId()

							return {
								data: updatedUser,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("User", "update")),
		}
	}),
)
