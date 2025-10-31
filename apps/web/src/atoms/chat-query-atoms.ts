import { Atom } from "@effect-atom/atom-react"
import type { Message, PinnedMessage, User } from "@hazel/db/models"
import type { ChannelId } from "@hazel/db/schema"
import { makeQuery } from "@hazel/tanstack-db-atom"
import { eq } from "@tanstack/db"
import { channelCollection } from "~/db/collections"

export type MessageWithPinned = typeof Message.Model.Type & {
	pinnedMessage: typeof PinnedMessage.Model.Type | null | undefined
	author: typeof User.Model.Type | null | undefined
}

export type ProcessedMessage = {
	message: MessageWithPinned
	isGroupStart: boolean
	isGroupEnd: boolean
	isFirstNewMessage: boolean
	isPinned: boolean
}

/**
 * Atom family for fetching a channel by ID
 * Returns the channel as an array (matching TanStack DB query results)
 */
export const channelByIdAtomFamily = Atom.family((channelId: ChannelId) =>
	makeQuery((q) =>
		q
			.from({ channel: channelCollection })
			.where(({ channel }) => eq(channel.id, channelId))
			.orderBy(({ channel }) => channel.createdAt, "desc")
			.limit(1),
	),
)
