import { ChannelMemberRepo, ChannelRepo, NotificationRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, policyUse, withRemapDbErrors, withSystemActor } from "@hazel/domain"
import { ChannelMemberRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { ChannelMemberPolicy } from "../../policies/channel-member-policy"
import { ChannelAccessSyncService } from "../../services/channel-access-sync"

export const ChannelMemberRpcLive = ChannelMemberRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database

		return {
			"channelMember.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							const createdChannelMember = yield* ChannelMemberRepo.insert({
								channelId: payload.channelId,
								userId: user.id,
								isHidden: false,
								isMuted: false,
								isFavorite: false,
								lastSeenMessageId: null,
								notificationCount: 0,
								joinedAt: new Date(),
								deletedAt: null,
							}).pipe(
								Effect.map((res) => res[0]!),
								policyUse(ChannelMemberPolicy.canCreate(payload.channelId)),
							)

							const channelOption = yield* ChannelRepo.findById(payload.channelId).pipe(
								withSystemActor,
							)
							if (Option.isSome(channelOption)) {
								yield* ChannelAccessSyncService.syncUserInOrganization(
									user.id,
									channelOption.value.organizationId,
								)
							}

							const txid = yield* generateTransactionId()

							return {
								data: createdChannelMember,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("ChannelMember", "create")),

			"channelMember.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const updatedChannelMember = yield* ChannelMemberRepo.update({
								id,
								...payload,
							}).pipe(policyUse(ChannelMemberPolicy.canUpdate(id)))

							const txid = yield* generateTransactionId()

							return {
								data: updatedChannelMember,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("ChannelMember", "update")),

			"channelMember.delete": ({ id }) =>
				db
					.transaction(
						Effect.gen(function* () {
							const deletedMemberOption =
								yield* ChannelMemberRepo.findById(id).pipe(withSystemActor)

							yield* ChannelMemberRepo.deleteById(id).pipe(
								policyUse(ChannelMemberPolicy.canDelete(id)),
							)

							if (Option.isSome(deletedMemberOption)) {
								const channelOption = yield* ChannelRepo.findById(
									deletedMemberOption.value.channelId,
								).pipe(withSystemActor)
								if (Option.isSome(channelOption)) {
									yield* ChannelAccessSyncService.syncUserInOrganization(
										deletedMemberOption.value.userId,
										channelOption.value.organizationId,
									)
								}
							}

							const txid = yield* generateTransactionId()

							return { transactionId: txid }
						}),
					)
					.pipe(withRemapDbErrors("ChannelMember", "delete")),

			"channelMember.clearNotifications": ({ channelId }) =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					// Find the channel member record for this user and channel
					const memberOption = yield* ChannelMemberRepo.findByChannelAndUser(
						channelId,
						user.id,
					).pipe(
						policyUse(ChannelMemberPolicy.canRead(channelId)),
						withRemapDbErrors("ChannelMember", "select"),
					)

					// Get channel to find organizationId
					const channelOption = yield* ChannelRepo.findById(channelId).pipe(
						withSystemActor,
						withRemapDbErrors("Channel", "select"),
					)

					// Get organization member for notification deletion
					const orgMemberOption = Option.isSome(channelOption)
						? yield* OrganizationMemberRepo.findByOrgAndUser(
								channelOption.value.organizationId,
								user.id,
							).pipe(withSystemActor, withRemapDbErrors("OrganizationMember", "select"))
						: Option.none()

					// Wrap the update and transaction ID generation in a single transaction
					const result = yield* db
						.transaction(
							Effect.gen(function* () {
								// If member exists, clear the notification count
								if (Option.isSome(memberOption)) {
									yield* ChannelMemberRepo.update({
										id: memberOption.value.id,
										notificationCount: 0,
									}).pipe(policyUse(ChannelMemberPolicy.canUpdate(memberOption.value.id)))
								}

								// Delete all notifications for this channel
								if (Option.isSome(orgMemberOption)) {
									yield* NotificationRepo.deleteByChannelId(
										channelId,
										orgMemberOption.value.id,
									).pipe(withSystemActor)
								}

								const txid = yield* generateTransactionId()

								return { transactionId: txid }
							}),
						)
						.pipe(withRemapDbErrors("ChannelMember", "update"))

					return result
				}),
		}
	}),
)
