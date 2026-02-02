import { UserPresenceStatusRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors } from "@hazel/domain"
import { UserPresenceStatusRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { UserPresenceStatusPolicy } from "../../policies/user-presence-status-policy"

export const UserPresenceStatusRpcLive = UserPresenceStatusRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"userPresenceStatus.update": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							const existingOption = yield* UserPresenceStatusRepo.findByUserId(user.id).pipe(
								policyUse(UserPresenceStatusPolicy.canRead()),
							)

							const existing = Option.getOrNull(existingOption)

							const now = new Date()
							const updatedStatus = yield* UserPresenceStatusRepo.upsertByUserId({
								userId: user.id,
								status: (payload.status ?? existing?.status ?? "online") as
									| "online"
									| "away"
									| "busy"
									| "dnd"
									| "offline",
								customMessage:
									payload.customMessage !== undefined
										? payload.customMessage
										: (existing?.customMessage ?? null),
								statusEmoji:
									payload.statusEmoji !== undefined
										? payload.statusEmoji
										: (existing?.statusEmoji ?? null),
								statusExpiresAt:
									payload.statusExpiresAt !== undefined
										? payload.statusExpiresAt
										: (existing?.statusExpiresAt ?? null),
								activeChannelId:
									payload.activeChannelId !== undefined
										? payload.activeChannelId
										: (existing?.activeChannelId ?? null),
								suppressNotifications:
									payload.suppressNotifications !== undefined
										? payload.suppressNotifications
										: (existing?.suppressNotifications ?? false),
								updatedAt: now,
								lastSeenAt: now, // Update heartbeat on any status change
							}).pipe(policyUse(UserPresenceStatusPolicy.canCreate()))

							const txid = yield* generateTransactionId()

							return {
								data: updatedStatus!,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("UserPresenceStatus", "update")),

			"userPresenceStatus.heartbeat": () =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							const result = yield* UserPresenceStatusRepo.updateHeartbeat(user.id).pipe(
								policyUse(UserPresenceStatusPolicy.canUpdate()),
							)

							// If no record exists, create one with online status
							if (Option.isNone(result)) {
								const now = new Date()
								yield* UserPresenceStatusRepo.upsertByUserId({
									userId: user.id,
									status: "online",
									customMessage: null,
									statusEmoji: null,
									statusExpiresAt: null,
									activeChannelId: null,
									suppressNotifications: false,
									updatedAt: now,
									lastSeenAt: now,
								}).pipe(policyUse(UserPresenceStatusPolicy.canCreate()))

								return { lastSeenAt: now }
							}

							return { lastSeenAt: result.value.lastSeenAt }
						}),
					)
					.pipe(withRemapDbErrors("UserPresenceStatus", "update")),

			"userPresenceStatus.clearStatus": () =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							const existingOption = yield* UserPresenceStatusRepo.findByUserId(user.id).pipe(
								policyUse(UserPresenceStatusPolicy.canRead()),
							)

							const existing = Option.getOrNull(existingOption)

							const now = new Date()
							const updatedStatus = yield* UserPresenceStatusRepo.upsertByUserId({
								userId: user.id,
								status: existing?.status ?? "online",
								customMessage: null,
								statusEmoji: null,
								statusExpiresAt: null,
								activeChannelId: existing?.activeChannelId ?? null,
								suppressNotifications: false,
								updatedAt: now,
								lastSeenAt: now,
							}).pipe(policyUse(UserPresenceStatusPolicy.canCreate()))

							const txid = yield* generateTransactionId()

							return {
								data: updatedStatus!,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("UserPresenceStatus", "update")),
		}
	}),
)
