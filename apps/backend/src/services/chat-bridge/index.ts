import type { ChannelId, ExternalChannelLinkId } from "@hazel/domain"
import type { ExternalChannelLink, IntegrationConnection, Message } from "@hazel/domain/models"
import { Effect, Option, Schema } from "effect"
import { ExternalChannelLinkRepo } from "../../repositories/external-channel-link-repo"
import { ExternalThreadLinkRepo } from "../../repositories/external-thread-link-repo"
import { MessageRepo } from "../../repositories/message-repo"
import { UserRepo } from "../../repositories/user-repo"
import { DatabaseLive } from "../database"
import type { ChatBridgeProvider } from "./types"

/**
 * ChatBridgeService
 *
 * Shared service for managing bidirectional chat sync between Hazel and external platforms.
 * Provides common functionality used by all provider adapters (Discord, Slack).
 */
export class ChatBridgeService extends Effect.Service<ChatBridgeService>()("ChatBridgeService", {
	accessors: true,
	effect: Effect.gen(function* () {
		const channelLinkRepo = yield* ExternalChannelLinkRepo
		const threadLinkRepo = yield* ExternalThreadLinkRepo
		const messageRepo = yield* MessageRepo
		const userRepo = yield* UserRepo

		/**
		 * Find all linked channels for an external channel.
		 * Used for inbound message routing.
		 */
		const findLinkedChannels = (
			provider: IntegrationConnection.IntegrationProvider,
			externalChannelId: string,
		) => channelLinkRepo.findByExternalChannel(provider, externalChannelId)

		/**
		 * Find all enabled external links for a Hazel channel.
		 * Used for outbound message routing.
		 */
		const findEnabledLinksForChannel = (channelId: ChannelId) =>
			channelLinkRepo.findEnabledByChannelId(channelId)

		/**
		 * Check if a message should be synced to a target provider.
		 * Returns false if the message originated from that provider (loop prevention).
		 */
		const shouldSyncToProvider = (message: Message.Model, targetProvider: ChatBridgeProvider) =>
			Effect.succeed(message.sourceProvider !== targetProvider)

		/**
		 * Find or create a thread link.
		 */
		const syncThread = (
			provider: IntegrationConnection.IntegrationProvider,
			hazelThreadId: ChannelId,
			externalThreadId: string,
			channelLinkId: ExternalChannelLinkId,
			externalParentMessageId?: string,
		) =>
			threadLinkRepo.upsert({
				provider,
				hazelThreadId,
				externalThreadId,
				externalParentMessageId: externalParentMessageId ?? null,
				channelLinkId,
			})

		/**
		 * Find existing thread link by Hazel thread ID.
		 */
		const findThreadLinkByHazelThread = (hazelThreadId: ChannelId) =>
			threadLinkRepo.findByHazelThreadId(hazelThreadId)

		/**
		 * Find existing thread link by external thread ID.
		 */
		const findThreadLinkByExternalThread = (
			provider: IntegrationConnection.IntegrationProvider,
			externalThreadId: string,
		) => threadLinkRepo.findByExternalThread(provider, externalThreadId)

		/**
		 * Get or create a bot user for a provider.
		 * Used for attributing bridged messages in Hazel.
		 */
		const getOrCreateBridgeBotUser = (
			provider: ChatBridgeProvider,
			authorId: string,
			authorName: string,
			authorAvatarUrl?: string,
		) =>
			Effect.gen(function* () {
				// Use a consistent external ID for bridge users
				const externalId = `bridge-${provider}-${authorId}`

				// Try to find existing user
				const existing = yield* userRepo.findByExternalId(externalId)
				if (Option.isSome(existing)) {
					return existing.value
				}

				// Create new machine user for this bridge author
				// Use the provided avatar or generate a default dicebear avatar
				const defaultAvatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(authorId)}`
				const newUser = yield* userRepo.insert({
					externalId,
					email: `${provider}-${authorId}@bridge.internal`,
					firstName: authorName,
					lastName: "",
					avatarUrl: authorAvatarUrl ?? defaultAvatarUrl,
					userType: "machine",
					settings: null,
					isOnboarded: true,
					timezone: null,
					deletedAt: null,
				})

				return newUser[0]
			})

		/**
		 * Create a channel link.
		 */
		const createChannelLink = (data: Schema.Schema.Type<typeof ExternalChannelLink.Insert>) =>
			channelLinkRepo.insert(data)

		/**
		 * Update a channel link.
		 */
		const updateChannelLink = (data: Schema.Schema.Type<typeof ExternalChannelLink.Update>) =>
			channelLinkRepo.update(data)

		/**
		 * Delete a channel link (soft delete).
		 */
		const deleteChannelLink = (id: ExternalChannelLinkId) => channelLinkRepo.softDelete(id)

		/**
		 * Check if a link already exists.
		 */
		const checkExistingLink = (
			channelId: ChannelId,
			provider: IntegrationConnection.IntegrationProvider,
			externalChannelId: string,
		) => channelLinkRepo.findExisting(channelId, provider, externalChannelId)

		return {
			// Channel link management
			findLinkedChannels,
			findEnabledLinksForChannel,
			createChannelLink,
			updateChannelLink,
			deleteChannelLink,
			checkExistingLink,

			// Thread sync
			syncThread,
			findThreadLinkByHazelThread,
			findThreadLinkByExternalThread,

			// Loop prevention
			shouldSyncToProvider,

			// User management for bridged messages
			getOrCreateBridgeBotUser,
		}
	}),
	dependencies: [
		DatabaseLive,
		ExternalChannelLinkRepo.Default,
		ExternalThreadLinkRepo.Default,
		MessageRepo.Default,
		UserRepo.Default,
	],
}) {}

// Re-export types
export * from "./types"
