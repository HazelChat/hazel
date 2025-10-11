import { Atom, Result } from "@effect-atom/atom-react"
import type { Message, User } from "@hazel/db/models"
import type { ChannelId, UserId } from "@hazel/db/schema"
import { makeQuery } from "@hazel/tanstack-db-atom"
import { eq, inArray } from "@tanstack/db"
import {
	channelCollection,
	messageCollection,
	pinnedMessageCollection,
	userCollection,
} from "~/db/collections"

type MessageWithPinned = typeof Message.Model.Type & {
	pinnedMessage: any
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

/**
 * Atom family for fetching messages by channel ID
 * Includes a left join with pinned messages to show pinned status
 * Returns messages ordered by creation date (most recent first)
 */
export const messagesByChannelAtomFamily = Atom.family((channelId: ChannelId) =>
	makeQuery(
		(q) =>
			q
				.from({ message: messageCollection })
				.leftJoin({ pinned: pinnedMessageCollection }, ({ message, pinned }) =>
					eq(message.id, pinned.messageId),
				)
				.where(({ message }) => eq(message.channelId, channelId))
				.select(({ message, pinned }) => ({
					...message,
					pinnedMessage: pinned,
				}))
				.orderBy(({ message }) => message.createdAt, "desc")
				.limit(50), // TODO: Implement proper pagination
	),
)

/**
 * Atom family for batch fetching users by their IDs
 * This is used to efficiently load all message authors at once
 * instead of making individual queries per message
 */
export const usersByIdsAtomFamily = Atom.family((userIds: UserId[]) =>
	makeQuery((q) => {
		// Only query if we have user IDs
		if (userIds.length === 0) {
			return q
				.from({ user: userCollection })
				.where(({ user }) => eq(user.id, "" as UserId))
				.orderBy(({ user }) => user.id, "asc")
				.limit(0)
		}

		return q
			.from({ user: userCollection })
			.where(({ user }) => inArray(user.id, userIds))
			.select(({ user }) => user)
			.orderBy(({ user }) => user.id, "asc")
	}),
)

/**
 * Derived atom: Processes raw messages into grouped messages with metadata
 * Automatically recomputes when messages change
 */
export const processedMessagesByChannelAtomFamily = Atom.family((channelId: ChannelId) =>
	Atom.make((get) => {
		// Read from the raw messages atom
		const messagesResult = get(messagesByChannelAtomFamily(channelId))
		const messages = Result.getOrElse(messagesResult, () => [])

		const timeThreshold = 5 * 60 * 1000
		const chronologicalMessages = [...messages].reverse()

		return chronologicalMessages.map((message, index): ProcessedMessage => {
			// Determine isGroupStart
			const prevMessage = index > 0 ? chronologicalMessages[index - 1] : null
			const isGroupStart =
				!prevMessage ||
				message.authorId !== prevMessage.authorId ||
				message.createdAt.getTime() - prevMessage.createdAt.getTime() > timeThreshold ||
				!!prevMessage.replyToMessageId

			// Determine isGroupEnd
			const nextMessage =
				index < chronologicalMessages.length - 1 ? chronologicalMessages[index + 1] : null
			const isGroupEnd =
				!nextMessage ||
				message.authorId !== nextMessage.authorId ||
				nextMessage.createdAt.getTime() - message.createdAt.getTime() > timeThreshold

			const isFirstNewMessage = false
			const isPinned = !!message.pinnedMessage?.id

			return {
				message,
				isGroupStart,
				isGroupEnd,
				isFirstNewMessage,
				isPinned,
			}
		})
	}),
)

/**
 * Derived atom: Extracts unique author IDs from messages
 */
export const authorIdsByChannelAtomFamily = Atom.family((channelId: ChannelId) =>
	Atom.make((get) => {
		const messagesResult = get(messagesByChannelAtomFamily(channelId))
		const messages = Result.getOrElse(messagesResult, () => [])
		return Array.from(new Set(messages.map((m) => m.authorId)))
	}),
)

/**
 * Derived atom: Batch fetches all authors for a channel and returns as Map
 */
export const authorsByChannelAtomFamily = Atom.family((channelId: ChannelId) =>
	Atom.make((get) => {
		const authorIds = get(authorIdsByChannelAtomFamily(channelId))
		const authorsResult = get(usersByIdsAtomFamily(authorIds))
		const authorsData = Result.getOrElse(authorsResult, () => [])

		const map = new Map<UserId, typeof User.Model.Type>()
		for (const author of authorsData) {
			map.set(author.id, author)
		}
		return map
	}),
)
