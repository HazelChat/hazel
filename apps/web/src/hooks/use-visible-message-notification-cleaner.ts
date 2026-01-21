import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelId, MessageId } from "@hazel/schema"
import { and, eq, useLiveQuery } from "@tanstack/react-db"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { notificationCollection, organizationMemberCollection } from "~/db/collections"
import { useAuth } from "~/lib/auth"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"
import { useOrganization } from "./use-organization"

const deleteNotificationsByMessageIdsMutation = HazelRpcClient.mutation(
	"notification.deleteByMessageIds",
)

interface UseVisibleMessageNotificationCleanerOptions {
	channelId: ChannelId
	debounceMs?: number
}

/**
 * Hook that deletes notifications when their associated messages become visible.
 *
 * Returns a callback to be called when visible message IDs change.
 * The hook will:
 * 1. Filter to only messages that have associated notifications
 * 2. Debounce multiple visibility changes
 * 3. Batch delete notifications via RPC
 */
export function useVisibleMessageNotificationCleaner(options: UseVisibleMessageNotificationCleanerOptions) {
	const { channelId, debounceMs = 500 } = options
	const { user } = useAuth()
	const { organizationId } = useOrganization()

	// Track pending message IDs to delete
	const pendingMessageIdsRef = useRef<Set<string>>(new Set())
	const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
	const deletedMessageIdsRef = useRef<Set<string>>(new Set())

	// Query for current member ID
	const { data: member } = useLiveQuery(
		(q) =>
			user?.id && organizationId
				? q
						.from({ member: organizationMemberCollection })
						.where(({ member }) =>
							and(eq(member.userId, user.id), eq(member.organizationId, organizationId)),
						)
						.findOne()
				: null,
		[user?.id, organizationId],
	)

	// Query notifications for this channel (message type only)
	const { data: channelNotifications } = useLiveQuery(
		(q) =>
			member?.id
				? q
						.from({ notification: notificationCollection })
						.where(({ notification }) =>
							and(
								eq(notification.memberId, member.id),
								eq(notification.targetedResourceId, channelId),
								eq(notification.resourceType, "message"),
							),
						)
				: null,
		[member?.id, channelId],
	)

	// Build a Set of message IDs that have notifications
	const messageIdsWithNotifications = useMemo(() => {
		const set = new Set<string>()
		if (channelNotifications) {
			for (const n of channelNotifications) {
				if (n.resourceId) {
					set.add(n.resourceId)
				}
			}
		}
		return set
	}, [channelNotifications])

	// Mutation for bulk delete
	const deleteNotifications = useAtomSet(deleteNotificationsByMessageIdsMutation, {
		mode: "promiseExit",
	})

	// Process pending deletions
	const processPendingDeletions = useCallback(() => {
		const messageIds = Array.from(pendingMessageIdsRef.current).filter(
			(id) => !deletedMessageIdsRef.current.has(id),
		) as MessageId[]

		if (messageIds.length === 0) return

		// Mark as deleted immediately to prevent duplicates
		for (const id of messageIds) {
			deletedMessageIdsRef.current.add(id)
		}
		pendingMessageIdsRef.current.clear()

		// Fire and forget - we don't need to await
		deleteNotifications({
			payload: { messageIds, channelId },
		}).catch(console.error)
	}, [deleteNotifications, channelId])

	// Handler called when visible messages change
	const onVisibleMessagesChange = useCallback(
		(visibleMessageIds: string[]) => {
			// Filter to only messages that have notifications
			const messagesWithNotifications = visibleMessageIds.filter(
				(id) => messageIdsWithNotifications.has(id) && !deletedMessageIdsRef.current.has(id),
			)

			if (messagesWithNotifications.length === 0) return

			// Add to pending set
			for (const id of messagesWithNotifications) {
				pendingMessageIdsRef.current.add(id)
			}

			// Debounce the deletion
			clearTimeout(debounceTimeoutRef.current)
			debounceTimeoutRef.current = setTimeout(processPendingDeletions, debounceMs)
		},
		[messageIdsWithNotifications, processPendingDeletions, debounceMs],
	)

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			clearTimeout(debounceTimeoutRef.current)
			// Process any remaining pending deletions
			if (pendingMessageIdsRef.current.size > 0) {
				processPendingDeletions()
			}
		}
	}, [processPendingDeletions])

	// Reset deleted tracking when channel changes
	useEffect(() => {
		deletedMessageIdsRef.current.clear()
		pendingMessageIdsRef.current.clear()
	}, [channelId])

	return { onVisibleMessagesChange }
}
