import { ChannelMemberRepo, ChannelRepo, NotificationRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { Database } from "@hazel/db"
import { CurrentUser, withRemapDbErrors } from "@hazel/domain"
import { ChannelMemberRpcs } from "@hazel/domain/rpc"
import { Effect, Option } from "effect"
import { generateTransactionId } from "../../lib/create-transactionId"
import { ChannelMemberPolicy } from "../../policies/channel-member-policy"
import { BotGatewayService } from "../../services/bot-gateway-service"
import { ChannelAccessSyncService } from "../../services/channel-access-sync"

export const ChannelMemberRpcLive = ChannelMemberRpcs.toLayer(
	Effect.gen(function* () {
		const db = yield* Database.Database
		const botGateway = yield* BotGatewayService

		return {
			"channelMember.create": (payload) =>
				db
					.transaction(
						Effect.gen(function* () {
							const user = yield* CurrentUser.Context

							yield* ChannelMemberPolicy.canCreate(payload.channelId)
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
							}).pipe(Effect.map((res) => res[0]!))

							const channelOption = yield* ChannelRepo.findById(payload.channelId)
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
					.pipe(
						withRemapDbErrors("ChannelMember", "create"),
						Effect.tap((response) =>
							botGateway.publishChannelMemberEvent("channel_member.add", response.data).pipe(
								Effect.catchTag("DurableStreamRequestError", (error) =>
									Effect.logWarning("Failed to publish channel_member.add to bot gateway", {
										error,
										channelMemberId: response.data.id,
									}),
								),
							),
						),
					),

			"channelMember.update": ({ id, ...payload }) =>
				db
					.transaction(
						Effect.gen(function* () {
							yield* ChannelMemberPolicy.canUpdate(id)
							const updatedChannelMember = yield* ChannelMemberRepo.update({
								id,
								...payload,
							})

							const txid = yield* generateTransactionId()

							return {
								data: updatedChannelMember,
								transactionId: txid,
							}
						}),
					)
					.pipe(withRemapDbErrors("ChannelMember", "update")),

			"channelMember.delete": ({ id }) =>
				Effect.gen(function* () {
					const deletedMemberOption = yield* ChannelMemberRepo.findById(id).pipe(
						withRemapDbErrors("ChannelMember", "select"),
					)
					const response = yield* db
						.transaction(
							Effect.gen(function* () {
								yield* ChannelMemberPolicy.canDelete(id)
								yield* ChannelMemberRepo.deleteById(id)

								if (Option.isSome(deletedMemberOption)) {
									const channelOption = yield* ChannelRepo.findById(
										deletedMemberOption.value.channelId,
									).pipe(withRemapDbErrors("Channel", "select"))
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
						.pipe(withRemapDbErrors("ChannelMember", "delete"))

					if (Option.isSome(deletedMemberOption)) {
						yield* botGateway
							.publishChannelMemberEvent("channel_member.remove", deletedMemberOption.value)
							.pipe(
								Effect.catchTag("DurableStreamRequestError", (error) =>
									Effect.logWarning(
										"Failed to publish channel_member.remove to bot gateway",
										{
											error,
											channelMemberId: deletedMemberOption.value.id,
										},
									),
								),
							)
					}

					return response
				}),

			"channelMember.clearNotifications": ({ channelId }) =>
				Effect.gen(function* () {
					const user = yield* CurrentUser.Context

					// Find the channel member record for this user and channel
					yield* ChannelMemberPolicy.canRead(channelId)
					const memberOption = yield* ChannelMemberRepo.findByChannelAndUser(
						channelId,
						user.id,
					).pipe(withRemapDbErrors("ChannelMember", "select"))

					// Get channel to find organizationId
					const channelOption = yield* ChannelRepo.findById(channelId).pipe(
						withRemapDbErrors("Channel", "select"),
					)

					// Get organization member for notification deletion
					const orgMemberOption = Option.isSome(channelOption)
						? yield* OrganizationMemberRepo.findByOrgAndUser(
								channelOption.value.organizationId,
								user.id,
							).pipe(withRemapDbErrors("OrganizationMember", "select"))
						: Option.none()

					// Wrap the update and transaction ID generation in a single transaction
					const result = yield* db
						.transaction(
							Effect.gen(function* () {
								// If member exists, clear the notification count
								if (Option.isSome(memberOption)) {
									yield* ChannelMemberPolicy.canUpdate(memberOption.value.id)
									yield* ChannelMemberRepo.update({
										id: memberOption.value.id,
										notificationCount: 0,
									})
								}

								// Delete all notifications for this channel
								if (Option.isSome(orgMemberOption)) {
									yield* NotificationRepo.deleteByChannelId(
										channelId,
										orgMemberOption.value.id,
									)
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
