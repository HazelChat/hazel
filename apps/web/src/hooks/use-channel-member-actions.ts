import { useAtomSet } from "@effect-atom/atom-react";
import type { ChannelMemberId } from "@hazel/schema";
import { deleteChannelMemberMutation } from "~/atoms/channel-member-atoms";
import { updateChannelMemberAction } from "~/db/actions";
import { matchExitWithToast } from "~/lib/toast-exit";

const MEMBER_NOT_FOUND_ERROR = {
	ChannelMemberNotFoundError: () => ({
		title: "Membership not found",
		description: "You may no longer be a member of this item.",
		isRetryable: false,
	}),
};

interface MemberState {
	id: ChannelMemberId;
	isMuted: boolean;
	isFavorite: boolean;
}

type ItemType = "channel" | "thread" | "conversation";

/**
 * Shared handlers for channel member actions (mute, favorite, leave).
 * Used by channel-item, thread-item, and dm-channel-item.
 */
export function useChannelMemberActions(
	member: MemberState,
	itemType: ItemType = "channel",
) {
	const updateMember = useAtomSet(updateChannelMemberAction, {
		mode: "promiseExit",
	});
	const deleteMember = useAtomSet(deleteChannelMemberMutation, {
		mode: "promiseExit",
	});

	const itemLabel = itemType.charAt(0).toUpperCase() + itemType.slice(1);

	const handleToggleMute = async () => {
		const exit = await updateMember({
			memberId: member.id,
			isMuted: !member.isMuted,
		});

		matchExitWithToast(exit, {
			onSuccess: () => {},
			successMessage: member.isMuted
				? `${itemLabel} unmuted`
				: `${itemLabel} muted`,
			customErrors: MEMBER_NOT_FOUND_ERROR,
		});
	};

	const handleToggleFavorite = async () => {
		const exit = await updateMember({
			memberId: member.id,
			isFavorite: !member.isFavorite,
		});

		matchExitWithToast(exit, {
			onSuccess: () => {},
			successMessage: member.isFavorite
				? "Removed from favorites"
				: "Added to favorites",
			customErrors: MEMBER_NOT_FOUND_ERROR,
		});
	};

	const handleLeave = async () => {
		const exit = await deleteMember({
			payload: { id: member.id },
		});

		matchExitWithToast(exit, {
			onSuccess: () => {},
			successMessage:
				itemType === "thread" ? "Left thread" : "Left channel successfully",
			customErrors: MEMBER_NOT_FOUND_ERROR,
		});
	};

	return { handleToggleMute, handleToggleFavorite, handleLeave };
}
