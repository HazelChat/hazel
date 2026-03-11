import {
	ChannelRepo,
	ConnectConversationChannelRepo,
	ConnectConversationRepo,
	MessageReactionRepo,
	MessageRepo,
} from "@hazel/backend-core"
import { InternalServerError } from "@hazel/domain"
import type { ChannelId, ConnectConversationId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Option } from "effect"
import { OrgResolver } from "./org-resolver"

export class ConnectConversationService extends Effect.Service<ConnectConversationService>()(
	"ConnectConversationService",
	{
		accessors: true,
		dependencies: [
			ChannelRepo.Default,
			ConnectConversationRepo.Default,
			ConnectConversationChannelRepo.Default,
			MessageRepo.Default,
			MessageReactionRepo.Default,
			OrgResolver.Default,
		],
		effect: Effect.gen(function* () {
			const channelRepo = yield* ChannelRepo
			const connectConversationRepo = yield* ConnectConversationRepo
			const connectConversationChannelRepo = yield* ConnectConversationChannelRepo
			const messageRepo = yield* MessageRepo
			const messageReactionRepo = yield* MessageReactionRepo
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
			)(function* (channelId: ChannelId, createdBy?: UserId) {
				const mount = yield* connectConversationChannelRepo.findByChannelId(channelId)
				if (Option.isSome(mount)) {
					return mount.value.conversationId
				}
				if (!createdBy) {
					return yield* Effect.succeed(null as ConnectConversationId | null)
				}
				const createdMount = yield* ensureChannelConversation(channelId, createdBy)
				return createdMount.conversationId
			})

			const listMountedChannels = Effect.fn("ConnectConversationService.listMountedChannels")(
				function* (conversationId: ConnectConversationId) {
					return yield* connectConversationChannelRepo.findByConversationId(conversationId)
				},
			)

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

			return {
				ensureChannelConversation,
				getConversationIdForChannel,
				listMountedChannels,
				canAccessConversation,
				getOrganizationIdForChannel,
			} as const
		}),
	},
) {}
