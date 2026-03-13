import {
	ChannelRepo,
	ConnectParticipantRepo,
	ConnectConversationChannelRepo,
	ConnectConversationRepo,
	MessageReactionRepo,
	MessageRepo,
} from "@hazel/backend-core"
import { InternalServerError } from "@hazel/domain"
import type { ChannelId, ConnectConversationId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Option } from "effect"
import { ChannelAccessSyncService } from "./channel-access-sync"
import { OrgResolver } from "./org-resolver"

export class ConnectConversationService extends Effect.Service<ConnectConversationService>()(
	"ConnectConversationService",
	{
		accessors: true,
		dependencies: [
			ChannelRepo.Default,
			ConnectParticipantRepo.Default,
			ConnectConversationRepo.Default,
			ConnectConversationChannelRepo.Default,
			MessageRepo.Default,
			MessageReactionRepo.Default,
			ChannelAccessSyncService.Default,
			OrgResolver.Default,
		],
		effect: Effect.gen(function* () {
			const channelRepo = yield* ChannelRepo
			const connectParticipantRepo = yield* ConnectParticipantRepo
			const connectConversationRepo = yield* ConnectConversationRepo
			const connectConversationChannelRepo = yield* ConnectConversationChannelRepo
			const messageRepo = yield* MessageRepo
			const messageReactionRepo = yield* MessageReactionRepo
			const channelAccessSync = yield* ChannelAccessSyncService
			const orgResolver = yield* OrgResolver

			const ensureChannelConversation = Effect.fn(
				"ConnectConversationService.ensureChannelConversation",
			)(function* (channelId: ChannelId, createdBy: UserId) {
				const existingMount = yield* connectConversationChannelRepo.findByChannelId(channelId)
				if (Option.isSome(existingMount)) {
					return existingMount.value
				}

				const channelOption = yield* channelRepo.findById(channelId)
				if (Option.isNone(channelOption)) {
					return yield* Effect.fail(
						new InternalServerError({
							message: "Cannot create conversation for missing channel",
							detail: `channelId=${channelId}`,
						}),
					)
				}

				const channel = channelOption.value
				const conversation = yield* connectConversationRepo
					.insert({
						hostOrganizationId: channel.organizationId,
						hostChannelId: channel.id,
						status: "active",
						settings: null,
						createdBy,
						deletedAt: null,
					})
					.pipe(Effect.map((results) => results[0]!))

				const mount = yield* connectConversationChannelRepo
					.insert({
						conversationId: conversation.id,
						organizationId: channel.organizationId,
						channelId: channel.id,
						role: "host",
						allowGuestMemberAdds: false,
						isActive: true,
						deletedAt: null,
					})
					.pipe(Effect.map((results) => results[0]!))

				yield* messageRepo.backfillConversationIdForChannel(channel.id, conversation.id)
				yield* messageReactionRepo.backfillConversationIdForChannel(channel.id, conversation.id)

				return mount
			})

			const getConversationIdForChannel = Effect.fn(
				"ConnectConversationService.getConversationIdForChannel",
			)(function* (channelId: ChannelId) {
				const mount = yield* connectConversationChannelRepo.findByChannelId(channelId)
				if (Option.isSome(mount)) {
					return mount.value.conversationId
				}
				return yield* Effect.succeed(null as ConnectConversationId | null)
			})

			const listMountedChannels = Effect.fn("ConnectConversationService.listMountedChannels")(
				function* (conversationId: ConnectConversationId) {
					return yield* connectConversationChannelRepo.findByConversationId(conversationId)
				},
			)

			const getMountForChannel = Effect.fn("ConnectConversationService.getMountForChannel")(function* (
				channelId: ChannelId,
			) {
				return yield* connectConversationChannelRepo.findByChannelId(channelId)
			})

			const canAccessConversation = Effect.fn("ConnectConversationService.canAccessConversation")(
				function* (
					conversationId: ConnectConversationId,
					scope: Parameters<typeof orgResolver.fromChannelWithAccess>[1],
				) {
					const mounts = yield* connectConversationChannelRepo.findByConversationId(conversationId)
					for (const mount of mounts) {
						const attempt = yield* orgResolver
							.fromChannelWithAccess(mount.channelId, scope, "ConnectConversation", "read")
							.pipe(Effect.either)
						if (attempt._tag === "Right") {
							return true
						}
					}
					return false
				},
			)

			const getOrganizationIdForChannel = Effect.fn(
				"ConnectConversationService.getOrganizationIdForChannel",
			)(function* (channelId: ChannelId) {
				const channelOption = yield* channelRepo.findById(channelId)
				if (Option.isNone(channelOption)) {
					return yield* Effect.succeed(null as OrganizationId | null)
				}
				return channelOption.value.organizationId
			})

			const syncMountChannels = Effect.fn("ConnectConversationService.syncMountChannels")(function* (
				mounts: ReadonlyArray<{ channelId: ChannelId }>,
			) {
				yield* Effect.forEach(mounts, (mount) => channelAccessSync.syncChannel(mount.channelId), {
					concurrency: 10,
				})
			})

			const removeParticipantFromConversation = Effect.fn(
				"ConnectConversationService.removeParticipantFromConversation",
			)(function* (conversationId: ConnectConversationId, userId: UserId) {
				const participants = yield* connectParticipantRepo.listByConversation(conversationId)
				const mounts = yield* connectConversationChannelRepo.findByConversationId(conversationId)

				yield* Effect.forEach(
					participants.filter((participant) => participant.userId === userId),
					(participant) =>
						connectParticipantRepo.update({
							id: participant.id,
							deletedAt: new Date(),
						}),
					{ concurrency: 10 },
				)

				yield* syncMountChannels(mounts)
			})

			const disconnectOrganization = Effect.fn("ConnectConversationService.disconnectOrganization")(
				function* (conversationId: ConnectConversationId, organizationId: OrganizationId) {
					const conversationOption = yield* connectConversationRepo.findById(conversationId)
					if (Option.isNone(conversationOption)) {
						return yield* Effect.fail(
							new InternalServerError({
								message: "Hazel Connect conversation not found",
								detail: `conversationId=${conversationId}`,
							}),
						)
					}

					const conversation = conversationOption.value
					const mounts = yield* connectConversationChannelRepo.findByConversationId(conversationId)
					const targetMount =
						mounts.find((mount) => mount.organizationId === organizationId) ?? null
					const participants = yield* connectParticipantRepo.listByConversation(conversationId)

					if (organizationId === conversation.hostOrganizationId) {
						yield* Effect.forEach(
							mounts,
							(mount) =>
								connectConversationChannelRepo.update({
									id: mount.id,
									isActive: false,
									deletedAt: new Date(),
								}),
							{ concurrency: 10 },
						)
						yield* Effect.forEach(
							participants,
							(participant) =>
								connectParticipantRepo.update({
									id: participant.id,
									deletedAt: new Date(),
								}),
							{ concurrency: 10 },
						)
						yield* connectConversationRepo.update({
							id: conversationId,
							status: "disconnected",
							deletedAt: new Date(),
						})
						yield* syncMountChannels(mounts)
						return
					}

					if (targetMount) {
						yield* connectConversationChannelRepo.update({
							id: targetMount.id,
							isActive: false,
							deletedAt: new Date(),
						})
					}

					yield* Effect.forEach(
						participants.filter(
							(participant) => participant.homeOrganizationId === organizationId,
						),
						(participant) =>
							connectParticipantRepo.update({
								id: participant.id,
								deletedAt: new Date(),
							}),
						{ concurrency: 10 },
					)

					yield* syncMountChannels(mounts)
				},
			)

			return {
				ensureChannelConversation,
				getConversationIdForChannel,
				getMountForChannel,
				listMountedChannels,
				canAccessConversation,
				getOrganizationIdForChannel,
				removeParticipantFromConversation,
				disconnectOrganization,
			} as const
		}),
	},
) {}
