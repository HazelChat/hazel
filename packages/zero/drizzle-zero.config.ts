import { schema } from "@maki-chat/drizzle"
import { drizzleZeroConfig } from "drizzle-zero"

export default drizzleZeroConfig(schema, {
	casing: "camelCase",
	tables: {
		users: {
			id: true,
			tag: true,
			displayName: true,
			avatarUrl: true,
			lastSeen: true,
			status: true,
		},
		server: {
			id: true,
			ownerId: true,
			name: true,
			slug: true,
			imageUrl: true,
			type: true,
			createdAt: true,
			updatedAt: true,
		},
		serverMembers: {
			id: true,
			userId: true,
			serverId: true,
			role: true,
			joinedAt: true,
		},
		serverChannels: {
			id: true,
			serverId: true,
			name: true,
			channelType: true,
			createdAt: true,
			updatedAt: true,
			parentChannelId: true,
		},
		channelMembers: {
			userId: true,
			channelId: true,
			joinedAt: true,
			isHidden: true,
			isMuted: true,

			lastSeenMessageId: true,
			notificationCount: true,
		},

		messages: {
			id: true,
			content: true,
			channelId: true,
			threadChannelId: true,
			authorId: true,
			replyToMessageId: true,
			attachedFiles: true,
			createdAt: true,
			updatedAt: true,
			optimisticId: true,
		},
		pinnedMessages: {
			messageId: true,
			channelId: true,
		},
		reactions: {
			id: true,
			messageId: true,
			userId: true,
			emoji: true,
			createdAt: true,
		},
	},
	manyToMany: {
		server: {
			users: ["serverMembers", "users"],
		},
		users: {
			servers: ["serverMembers", "server"],
			serverChannels: ["channelMembers", "serverChannels"],
		},
		serverChannels: {
			users: ["channelMembers", "users"],
			// pinnedMessages: ["pinnedMessages", "messages"],
		},
		messages: {
			// pinnedInChannels: ["pinnedMessages", "serverChannels"],
		},
	},
})
