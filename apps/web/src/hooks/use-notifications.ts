import type { Channel, Message, Notification, User } from "@hazel/domain/models"
import type { NotificationId } from "@hazel/schema"
import { and, eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { Effect } from "effect"
import { useCallback, useMemo } from "react"
import {
	channelCollection,
	messageCollection,
	notificationCollection,
	organizationMemberCollection,
	userCollection,
} from "~/db/collections"
import { useAuth } from "~/lib/auth"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"
import { runtime } from "~/lib/services/common/runtime"
import { useOrganization } from "./use-organization"

/**
 * Hook to get the current user's organization member record
 */
function useOrganizationMember() {
	const { user } = useAuth()
	const { organizationId } = useOrganization()

	const { data, isLoading } = useLiveQuery(
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

	return { member: data, memberId: data?.id, isLoading }
}

export interface NotificationWithDetails {
	notification: typeof Notification.Model.Type
	message?: typeof Message.Model.Type
	channel?: typeof Channel.Model.Type
	author?: typeof User.Model.Type
}

/**
 * Hook to manage notifications for the current user
 *
 * Returns notifications with joined message, channel, and author data,
 * plus functions to mark notifications as read.
 */
export function useNotifications() {
	const { memberId, isLoading: memberLoading } = useOrganizationMember()

	// Query notifications with joined data
	const { data: notificationsData, isLoading: notificationsLoading } = useLiveQuery(
		(q) =>
			memberId
				? q
						.from({ notification: notificationCollection })
						.leftJoin({ message: messageCollection }, ({ notification, message }) =>
							eq(notification.resourceId, message.id),
						)
						.leftJoin({ channel: channelCollection }, ({ notification, channel }) =>
							eq(notification.targetedResourceId, channel.id),
						)
						.leftJoin({ author: userCollection }, ({ message, author }) =>
							eq(message!.authorId, author.id),
						)
						.where(({ notification }) => eq(notification.memberId, memberId))
						.orderBy(({ notification }) => notification.createdAt, "desc")
				: null,
		[memberId],
	)

	// Process notifications into a cleaner structure
	const notifications = useMemo<NotificationWithDetails[]>(() => {
		if (!notificationsData) return []

		return notificationsData.map((row) => ({
			notification: row.notification as typeof Notification.Model.Type,
			message: (row.message ?? undefined) as typeof Message.Model.Type | undefined,
			channel: (row.channel ?? undefined) as typeof Channel.Model.Type | undefined,
			author: (row.author ?? undefined) as typeof User.Model.Type | undefined,
		}))
	}, [notificationsData])

	// Calculate unread count
	const unreadCount = useMemo(() => {
		return notifications.filter((n) => n.notification.readAt === null).length
	}, [notifications])

	// Mark a single notification as read
	const markAsRead = useCallback(async (notificationId: NotificationId) => {
		const program = Effect.gen(function* () {
			const client = yield* HazelRpcClient
			yield* client("notification.update", {
				id: notificationId,
				readAt: new Date(),
			} as any)
		})

		await runtime.runPromise(program).catch(console.error)
	}, [])

	// Mark all notifications as read
	const markAllAsRead = useCallback(async () => {
		const unreadNotifications = notifications.filter((n) => n.notification.readAt === null)

		// Mark each notification as read
		for (const { notification } of unreadNotifications) {
			await markAsRead(notification.id)
		}
	}, [notifications, markAsRead])

	return {
		notifications,
		unreadCount,
		isLoading: memberLoading || notificationsLoading,
		markAsRead,
		markAllAsRead,
		memberId,
	}
}

/**
 * Lightweight hook that only returns the unread notification count
 * Use this in components that only need to display the badge count
 */
export function useUnreadNotificationCount() {
	const { memberId, isLoading: memberLoading } = useOrganizationMember()

	const { data: notifications, isLoading: notificationsLoading } = useLiveQuery(
		(q) =>
			memberId
				? q
						.from({ notification: notificationCollection })
						.where(({ notification }) =>
							and(eq(notification.memberId, memberId), isNull(notification.readAt)),
						)
				: null,
		[memberId],
	)

	return {
		unreadCount: notifications?.length ?? 0,
		isLoading: memberLoading || notificationsLoading,
	}
}
