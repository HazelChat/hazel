import { ClerkClient } from "@hazel/auth"
import { UserRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, InternalServerError, withRemapDbErrors } from "@hazel/domain"
import { UserNotFoundError, UserResponse, UserRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { UserPolicy } from "../../policies/user-policy"

export const UserRpcLive = UserRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database
		const clerk = yield* ClerkClient
		const userPolicy = yield* UserPolicy
		const userRepo = yield* UserRepo

		return {
			"user.me": () => CurrentUser.Context.asEffect(),

			"user.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* userPolicy.canUpdate(id)
							const updatedUser = yield* userRepo.update({
								id,
								...payload,
							})

							// Sync display name to Clerk. `externalId` holds the Clerk user ID post-cutover.
							yield* Effect.tryPromise({
								try: () =>
									clerk.raw.users.updateUser(updatedUser.externalId, {
										firstName: payload.firstName,
										lastName: payload.lastName,
									}),
								catch: (error) =>
									new InternalServerError({
										message: "Failed to update user in Clerk",
										detail: String(error),
										cause: String(error),
									}),
							})

							const txid = yield* generateTransactionId()

							return new UserResponse({
								data: updatedUser,
								transactionId: txid,
							})
						}),
					)
					.pipe(withRemapDbErrors("User", "update")),

			"user.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* userPolicy.canRead(id)
							const userOption = yield* userRepo.findById(id)

							const user = yield* Option.match(userOption, {
								onNone: () => Effect.fail(new UserNotFoundError({ userId: id })),
								onSome: (user) => Effect.succeed(user),
							})

							yield* userPolicy.canDelete(id)
							yield* userRepo.deleteById(id)

							yield* Effect.tryPromise({
								try: () => clerk.raw.users.deleteUser(user.externalId),
								catch: (error) =>
									new InternalServerError({
										message: "Failed to delete user in Clerk",
										detail: String(error),
										cause: String(error),
									}),
							})

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

							yield* userPolicy.canUpdate(currentUser.id)
							const updatedUser = yield* userRepo.update({
								id: currentUser.id,
								isOnboarded: true,
							})

							const txid = yield* generateTransactionId()

							return new UserResponse({
								data: updatedUser,
								transactionId: txid,
							})
						}),
					)
					.pipe(withRemapDbErrors("User", "update")),

			"user.resetAvatar": () =>
				db
					.transaction(
						Effect.gen(function* () {
							const currentUser = yield* CurrentUser.Context

							yield* userPolicy.canRead(currentUser.id)
							const userOption = yield* userRepo.findById(currentUser.id)

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

							// Fetch user from Clerk to get their OAuth/upload profile image.
							const clerkUser = yield* Effect.tryPromise({
								try: () => clerk.raw.users.getUser(user.externalId),
								catch: (error) =>
									new InternalServerError({
										message: "Failed to fetch user from Clerk",
										detail: String(error),
										cause: String(error),
									}),
							})

							const avatarUrl = clerkUser.imageUrl?.trim() ? clerkUser.imageUrl : null

							yield* userPolicy.canUpdate(currentUser.id)
							const updatedUser = yield* userRepo.update({
								id: currentUser.id,
								avatarUrl,
							})

							const txid = yield* generateTransactionId()

							return new UserResponse({
								data: updatedUser,
								transactionId: txid,
							})
						}),
					)
					.pipe(withRemapDbErrors("User", "update")),
		}
	}),
)
