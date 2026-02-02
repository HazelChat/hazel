import { ChannelRepo, NotificationRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, policyUse, UnauthorizedError, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import { NotificationRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { NotificationPolicy } from "../../policies/notification-policy"

/**
 * Notification RPC Handlers
 *
 * Implements the business logic for all notification-related RPC methods.
 * Each handler receives the payload and has access to CurrentUser via Effect context
 * (provided by AuthMiddleware).
 *
 * All handlers use:
 * - Database transactions for atomicity
 * - Policy checks for authorization
 * - Transaction IDs for optimistic updates
 * - Error remapping for consistent error handling
 */
export const NotificationRpcLive = NotificationRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"notification.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const createdNotification = yield* NotificationRepo.insert({
								...payload,
							}).pipe(
								Effect.map((res) => res[0]!),
								policyUse(NotificationPolicy.canCreate(payload.memberId)),
							)

							const txid = yield* generateTransactionId()

							return {
								data: createdNotification,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("Notification", "create")),

			"notification.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const updatedNotification = yield* NotificationRepo.update({
								id,
								...payload,
							}).pipe(policyUse(NotificationPolicy.canUpdate(id)))

							const txid = yield* generateTransactionId()

							return {
								data: updatedNotification,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("Notification", "update")),

			"notification.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* NotificationRepo.deleteById(id).pipe(
								policyUse(NotificationPolicy.canDelete(id)),
							)

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("Notification", "delete")),

			"notification.deleteByMessageIds": ({ messageIds, channelId }) =>
				Effect.gen(function* () {
					// Skip if no message IDs provided
					if (messageIds.length === 0) {
						const txid = yield* generateTransactionId()
						return { deletedCount: 0, transactionId: txid }
					}

					const user = yield* CurrentUser.Context

					// Get the channel to find the organization (system operation)
					const channelOption = yield* ChannelRepo.findById(channelId).pipe(
						withSystemActor,
						withRemapDbErrors("Channel", "select"),
					)

					if (Option.isNone(channelOption)) {
						return yield* Effect.fail(
							new UnauthorizedError({
								message: "Channel not found",
								detail: "The specified channel does not exist",
							}),
						)
					}

					const channel = channelOption.value

					// Get the organization member for this user (system operation)
					const memberOption = yield* OrganizationMemberRepo.findByOrgAndUser(
						channel.organizationId,
						user.id,
					).pipe(withSystemActor, withRemapDbErrors("OrganizationMember", "select"))

					if (Option.isNone(memberOption)) {
						return yield* Effect.fail(
							new UnauthorizedError({
								message: "Not a member of this organization",
								detail: "You must be a member of the organization to clear notifications",
							}),
						)
					}

					const member = memberOption.value

					// Delete notifications for these messages belonging to this member
					// Authorization is already handled by checking organization membership above
					const result = yield* db
						.transaction(
							Effect.gen(function* () {
								const deleted = yield* NotificationRepo.deleteByMessageIds(
									messageIds,
									member.id,
								).pipe(withSystemActor)

								const txid = yield* generateTransactionId()

								return {
									deletedCount: deleted.length,
									transactionId: txid,
								}
							}),
						)
						.pipe(withRemapDbErrors("Notification", "delete"))

					return result
				}),
		}
	}),
)
