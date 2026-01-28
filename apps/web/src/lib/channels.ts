import type { Channel } from "@hazel/domain/models"
import type { OrganizationId, UserId } from "@hazel/schema"
import { createLiveQueryCollection, eq, or } from "@tanstack/react-db"
import { channelCollection, channelMemberCollection } from "~/db/collections"

/**
 * Live query collection for all DM channels (single and direct) with their members.
 * This collection is reactive and updates automatically when channels or members change.
 */
export const dmChannelsCollection = createLiveQueryCollection({
	startSync: true,
	query: (q) =>
		q
			.from({ channel: channelCollection })
			.innerJoin({ member: channelMemberCollection }, ({ channel, member }) =>
				eq(member.channelId, channel.id),
			)
			.where(({ channel }) => or(eq(channel.type, "single"), eq(channel.type, "direct"))),
})

/**
 * Finds an existing DM channel between users within a specific organization.
 * This is a synchronous function that reads from the local collection.
 *
 * @param currentUserId - The current user's ID
 * @param targetUserIds - Array of target user IDs
 * @param organizationId - The organization to search within
 * @returns The channel if found, otherwise null
 */
export function findExistingDmChannel(
	currentUserId: UserId,
	targetUserIds: UserId[],
	organizationId: OrganizationId,
): typeof Channel.Model.Type | null {
	const channels = dmChannelsCollection.toArray

	if (!channels || channels.length === 0 || targetUserIds.length === 0) {
		return null
	}

	const allParticipants = [currentUserId, ...targetUserIds]

	// Group channels by channel ID to get all members per channel
	const channelMembersMap = new Map<string, { channel: typeof Channel.Model.Type; memberIds: string[] }>()

	for (const item of channels) {
		// Skip channels from other organizations
		if (item.channel.organizationId !== organizationId) {
			continue
		}
		if (!channelMembersMap.has(item.channel.id)) {
			channelMembersMap.set(item.channel.id, {
				channel: item.channel,
				memberIds: [],
			})
		}
		channelMembersMap.get(item.channel.id)!.memberIds.push(item.member.userId)
	}

	// Find a channel that has exactly the participants we're looking for
	for (const { channel, memberIds } of channelMembersMap.values()) {
		// For single DMs: exactly 2 members matching our participants
		if (channel.type === "single" && targetUserIds.length === 1 && targetUserIds[0]) {
			if (
				memberIds.length === 2 &&
				memberIds.includes(currentUserId) &&
				memberIds.includes(targetUserIds[0])
			) {
				return channel
			}
		}

		// For group DMs: all participants must match exactly
		if (channel.type === "direct" && targetUserIds.length > 1) {
			const sortedMemberIds = [...memberIds].sort()
			const sortedParticipants = [...allParticipants].sort()

			if (
				sortedMemberIds.length === sortedParticipants.length &&
				sortedMemberIds.every((id, i) => id === sortedParticipants[i])
			) {
				return channel
			}
		}
	}

	return null
}
