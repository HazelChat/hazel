import { Atom } from "@effect-atom/atom-react"
import type { ChannelId, ChannelMemberId, TypingIndicatorId } from "@hazel/db/schema"
import { appRegistry } from "~/lib/registry"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Typing indicator state per channel member
 */
interface TypingIndicatorState {
	channelId: ChannelId
	memberId: ChannelMemberId
	isTyping: boolean
	lastTyped: number
}

/**
 * Atom family for per-channel-member typing state
 * Key format: "channelId:memberId"
 */
export const typingIndicatorAtomFamily = Atom.family((_key: string) =>
	Atom.make<TypingIndicatorState | null>(null).pipe(Atom.keepAlive),
)

/**
 * Mutation atom for creating/updating typing indicators
 */
const upsertTypingIndicatorMutation = HazelRpcClient.mutation("typingIndicator.create")

/**
 * Mutation atom for deleting typing indicators
 */
const deleteTypingIndicatorMutation = HazelRpcClient.mutation("typingIndicator.delete")

/**
 * Helper function to create atom key from channel and member IDs
 */
export const getTypingIndicatorKey = (channelId: ChannelId, memberId: ChannelMemberId): string => {
	return `${channelId}:${memberId}`
}

/**
 * Helper function to upsert typing indicator imperatively
 */
export const upsertTypingIndicator = async ({
	channelId,
	memberId,
}: {
	channelId: ChannelId
	memberId: ChannelMemberId
}) => {
	const key = getTypingIndicatorKey(channelId, memberId)
	const lastTyped = Date.now()

	// Update local atom state
	Atom.batch(() => {
		Atom.set(typingIndicatorAtomFamily(key), {
			channelId,
			memberId,
			isTyping: true,
			lastTyped,
		})
	})

	// Sync to server via mutation using app registry
	appRegistry.set(upsertTypingIndicatorMutation, {
		payload: {
			channelId,
			memberId,
			lastTyped,
		},
	})
}

/**
 * Helper function to delete typing indicator imperatively
 */
export const deleteTypingIndicator = ({ id }: { id: TypingIndicatorId }) => {
	appRegistry.set(deleteTypingIndicatorMutation, {
		payload: { id },
	})
}

/**
 * Helper function to clear typing state locally
 */
export const clearTypingIndicator = (channelId: ChannelId, memberId: ChannelMemberId) => {
	const key = getTypingIndicatorKey(channelId, memberId)

	Atom.batch(() => {
		Atom.set(typingIndicatorAtomFamily(key), null)
	})
}
