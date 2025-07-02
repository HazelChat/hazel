import type { Doc, Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import type { OptimisticLocalStore } from "convex/browser"
import { optimisticallyUpdateValueInPaginatedQuery } from "./create-paginated"

type Message = Doc<"messages">
export function optimisticAddReaction(
	store: OptimisticLocalStore,
	args: {
		serverId: Id<"servers">
		channelId: Id<"channels">
		messageId: Id<"messages">
		emoji: string
		userId: string
	},
) {
	const update = <T extends Message>(msg: T) =>
		({
			...msg,
			reactions: [...msg.reactions, { userId: args.userId, emoji: args.emoji }],
		}) as T

	optimisticallyUpdateValueInPaginatedQuery(
		store,
		api.messages.getMessages,
		{ channelId: args.channelId, serverId: args.serverId },
		(m) => (m._id === args.messageId ? update(m) : m) as any,
	)

	const current = store.getQuery(api.messages.getMessage, {
		id: args.messageId,
		channelId: args.channelId,
		serverId: args.serverId,
	})
	if (current) {
		store.setQuery(
			api.messages.getMessage,
			{ id: args.messageId, channelId: args.channelId, serverId: args.serverId },
			update(current),
		)
	}
}

export function optimisticRemoveReaction(
	store: OptimisticLocalStore,
	args: {
		serverId: Id<"servers">
		channelId: Id<"channels">
		messageId: Id<"messages">
		emoji: string
		userId: string
	},
) {
	const update = (msg: Doc<"messages">) => ({
		...msg,
		reactions: msg.reactions.filter((r) => !(r.userId === args.userId && r.emoji === args.emoji)),
	})

	optimisticallyUpdateValueInPaginatedQuery(
		store,
		api.messages.getMessages,
		{ channelId: args.channelId, serverId: args.serverId },
		(m) => (m._id === args.messageId ? update(m) : m) as any,
	)

	const current = store.getQuery(api.messages.getMessage, {
		id: args.messageId,
		channelId: args.channelId,
		serverId: args.serverId,
	})
	if (current) {
		store.setQuery(
			api.messages.getMessage,
			{ id: args.messageId, channelId: args.channelId, serverId: args.serverId },
			update(current) as any,
		)
	}
}
