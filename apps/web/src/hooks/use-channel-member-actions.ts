import { useAtomSet } from "@effect/atom-react"
import type { ChannelMemberId } from "@hazel/schema"
import { deleteChannelMemberMutation } from "~/atoms/channel-member-atoms"
import { updateChannelMemberAction } from "~/db/actions"
import { exitToast } from "~/lib/toast-exit"

const memberNotFoundError = () => ({
	title: "Membership not found",
	description: "You may no longer be a member of this item.",
	isRetryable: false,
})

interface MemberState {
	id: ChannelMemberId
	isMuted: boolean
	isFavorite: boolean
	isHidden: boolean
}

type ItemType = "channel" | "thread" | "conversation"

/**
 * Shared handlers for channel member actions (mute, favorite, leave).
 * Used by channel-item, thread-item, and dm-channel-item.
 */
export function useChannelMemberActions(member: MemberState | undefined, itemType: ItemType = "channel") {
	const updateMember = useAtomSet(updateChannelMemberAction, {
		mode: "promiseExit",
	})
	const deleteMember = useAtomSet(deleteChannelMemberMutation, {
		mode: "promiseExit",
	})

	const itemLabel = itemType.charAt(0).toUpperCase() + itemType.slice(1)

	const handleToggleMute = async () => {
		if (!member) return
		const exit = await updateMember({
			memberId: member.id,
			isMuted: !member.isMuted,
		})

		exitToast(exit)
			.successMessage(member.isMuted ? `${itemLabel} unmuted` : `${itemLabel} muted`)
			.onErrorTag("ChannelMemberNotFoundError", memberNotFoundError)
			.run()
	}

	const handleToggleFavorite = async () => {
		if (!member) return
		const exit = await updateMember({
			memberId: member.id,
			isFavorite: !member.isFavorite,
		})

		exitToast(exit)
			.successMessage(member.isFavorite ? "Removed from favorites" : "Added to favorites")
			.onErrorTag("ChannelMemberNotFoundError", memberNotFoundError)
			.run()
	}

	const handleLeave = async () => {
		if (!member) return
		const exit = await deleteMember({
			payload: { id: member.id },
		})

		exitToast(exit)
			.successMessage(itemType === "thread" ? "Left thread" : "Left channel successfully")
			.onErrorTag("ChannelMemberNotFoundError", memberNotFoundError)
			.run()
	}

	const handleToggleHidden = async () => {
		if (!member) return
		const exit = await updateMember({
			memberId: member.id,
			isHidden: !member.isHidden,
		})

		exitToast(exit)
			.successMessage(member.isHidden ? "Conversation unhidden" : "Conversation hidden")
			.onErrorTag("ChannelMemberNotFoundError", memberNotFoundError)
			.run()
	}

	return { handleToggleMute, handleToggleFavorite, handleLeave, handleToggleHidden }
}
