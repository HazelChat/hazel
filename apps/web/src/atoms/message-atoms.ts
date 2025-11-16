import { Atom, Result } from "@effect-atom/atom-react"
import type { ChannelId, MessageId, UserId } from "@hazel/schema"
import { makeQuery } from "@hazel/tanstack-db-atom"
import { count, eq } from "@tanstack/db"
import {
	messageCollection,
	messageReactionCollection,
	userCollection,
	userPresenceStatusCollection,
} from "~/db/collections"

/**
 * Atom family for fetching reactions for a specific message
 * Automatically deduplicates - if multiple MessageItems show the same message,
 * only one query is executed
 */
export const messageReactionsAtomFamily = Atom.family((messageId: MessageId) =>
	makeQuery((q) =>
		q.from({ reactions: messageReactionCollection }).where((q) => eq(q.reactions.messageId, messageId)),
	),
)

/**
 * Derived atom that processes raw reactions into aggregated format
 * Computation is memoized and only runs when reactions change
 */
export const processedReactionsAtomFamily = Atom.family(
	({ messageId, currentUserId }: { messageId: MessageId; currentUserId: string }) =>
		Atom.make((get) => {
			const reactionsResult = get(messageReactionsAtomFamily(messageId))
			const reactions = Result.getOrElse(reactionsResult, () => [])

			// Aggregate reactions by emoji
			return Object.entries(
				reactions.reduce(
					(acc, reaction) => {
						if (!acc[reaction.emoji]) {
							acc[reaction.emoji] = {
								count: 0,
								users: [],
								hasReacted: false,
							}
						}
						acc[reaction.emoji]!.count++
						acc[reaction.emoji]!.users.push(reaction.userId)
						if (reaction.userId === currentUserId) {
							acc[reaction.emoji]!.hasReacted = true
						}
						return acc
					},
					{} as Record<string, { count: number; users: string[]; hasReacted: boolean }>,
				),
			)
		}),
)

/**
 * Atom family for fetching user data with presence status
 * Automatically deduplicates - if the same user appears in multiple messages,
 * only one query is executed and the result is shared
 */
export const userWithPresenceAtomFamily = Atom.family((userId: UserId) =>
	makeQuery((q) =>
		q
			.from({ user: userCollection })
			.leftJoin({ presence: userPresenceStatusCollection }, ({ user, presence }) =>
				eq(user.id, presence.userId),
			)
			.where((q) => eq(q.user.id, userId))
			.select(({ user, presence }) => ({ user, presence })),
	),
)

/**
 * Atom family for fetching a message with its author
 * Used primarily for reply sections
 */
export const messageWithAuthorAtomFamily = Atom.family((messageId: MessageId) =>
	makeQuery((q) =>
		q
			.from({ message: messageCollection })
			.innerJoin({ author: userCollection }, ({ message, author }) => eq(message.authorId, author.id))
			.where((q) => eq(q.message.id, messageId))
			.findOne()
			.select(({ message, author }) => ({ ...message, author: author }))
			.orderBy((q) => q.message.createdAt, "desc"),
	),
)

/**
 * Atom family for fetching thread messages by channel ID
 * Returns messages in chronological order
 */
export const threadMessagesAtomFamily = Atom.family(
	({ threadChannelId, maxPreviewMessages }: { threadChannelId: ChannelId; maxPreviewMessages: number }) =>
		makeQuery(
			(q) =>
				q
					.from({ message: messageCollection })
					.where(({ message }) => eq(message.channelId, threadChannelId))
					.orderBy(({ message }) => message.createdAt, "asc")
					.limit(maxPreviewMessages + 1), // Fetch one extra to check if there are more
		),
)

/**
 * Atom family for counting total messages in a thread
 */
export const threadMessageCountAtomFamily = Atom.family((threadChannelId: ChannelId) =>
	makeQuery((q) =>
		q
			.from({ message: messageCollection })
			.where(({ message }) => eq(message.channelId, threadChannelId))
			.select(({ message }) => ({
				count: count(message.id),
			})),
	),
)
