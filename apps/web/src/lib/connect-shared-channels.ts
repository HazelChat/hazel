import type { ChannelId, ConnectConversationId } from "@hazel/schema"

type ConnectMountLike = {
	channelId: ChannelId
	conversationId: ConnectConversationId
	isActive: boolean
	deletedAt: Date | null
}

const isActiveMount = (mount: ConnectMountLike) => mount.isActive && mount.deletedAt === null

const getSharedConversationIds = (mounts: readonly ConnectMountLike[]) => {
	const counts = new Map<ConnectConversationId, number>()

	for (const mount of mounts) {
		if (!isActiveMount(mount)) continue
		counts.set(mount.conversationId, (counts.get(mount.conversationId) ?? 0) + 1)
	}

	return new Set(
		Array.from(counts.entries())
			.filter(([, count]) => count > 1)
			.map(([conversationId]) => conversationId),
	)
}

export const getSharedConversationIdForChannel = (
	channelId: ChannelId,
	mounts: readonly ConnectMountLike[],
): ConnectConversationId | null => {
	const sharedConversationIds = getSharedConversationIds(mounts)

	for (const mount of mounts) {
		if (!isActiveMount(mount)) continue
		if (mount.channelId === channelId && sharedConversationIds.has(mount.conversationId)) {
			return mount.conversationId
		}
	}

	return null
}

export const getSharedChannelIds = (mounts: readonly ConnectMountLike[]) => {
	const sharedConversationIds = getSharedConversationIds(mounts)

	return new Set<ChannelId>(
		mounts
			.filter((mount) => isActiveMount(mount) && sharedConversationIds.has(mount.conversationId))
			.map((mount) => mount.channelId),
	)
}

export const getSharedConversationMountsForChannel = <TMount extends ConnectMountLike>(
	channelId: ChannelId,
	mounts: readonly TMount[],
): TMount[] => {
	const conversationId = getSharedConversationIdForChannel(channelId, mounts)
	if (!conversationId) return []

	return mounts.filter((mount) => isActiveMount(mount) && mount.conversationId === conversationId)
}
