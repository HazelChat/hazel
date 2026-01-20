import { isThisWeek, isToday, isYesterday } from "date-fns"
import { useMemo } from "react"
import type { NotificationWithDetails } from "./use-notifications"
import { useNotifications } from "./use-notifications"

export type NotificationCategory = "all" | "general" | "threads" | "dms"

export interface NotificationGroup {
	label: string
	notifications: NotificationWithDetails[]
}

/**
 * Groups notifications by time period
 */
function groupNotificationsByTime(notifications: NotificationWithDetails[]): NotificationGroup[] {
	const today: NotificationWithDetails[] = []
	const yesterday: NotificationWithDetails[] = []
	const thisWeek: NotificationWithDetails[] = []
	const older: NotificationWithDetails[] = []

	for (const notification of notifications) {
		const createdAt = new Date(notification.notification.createdAt)

		if (isToday(createdAt)) {
			today.push(notification)
		} else if (isYesterday(createdAt)) {
			yesterday.push(notification)
		} else if (isThisWeek(createdAt)) {
			thisWeek.push(notification)
		} else {
			older.push(notification)
		}
	}

	const groups: NotificationGroup[] = []

	if (today.length > 0) {
		groups.push({ label: "Today", notifications: today })
	}
	if (yesterday.length > 0) {
		groups.push({ label: "Yesterday", notifications: yesterday })
	}
	if (thisWeek.length > 0) {
		groups.push({ label: "This Week", notifications: thisWeek })
	}
	if (older.length > 0) {
		groups.push({ label: "Older", notifications: older })
	}

	return groups
}

/**
 * Filters notifications by category
 */
function filterNotificationsByCategory(
	notifications: NotificationWithDetails[],
	category: NotificationCategory,
): NotificationWithDetails[] {
	if (category === "all") {
		return notifications
	}

	if (category === "general") {
		return notifications.filter((n) => n.channel?.type === "public" || n.channel?.type === "private")
	}

	if (category === "threads") {
		return notifications.filter((n) => n.channel?.type === "thread")
	}

	if (category === "dms") {
		return notifications.filter((n) => n.channel?.type === "direct" || n.channel?.type === "single")
	}

	return notifications
}

/**
 * Hook for filtering and time-grouping notifications
 *
 * @param category - The category to filter by: 'all', 'threads', or 'dms'
 * @returns Grouped notifications and empty state flag
 */
export function useGroupedNotifications(category: NotificationCategory) {
	const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications()

	const filteredNotifications = useMemo(() => {
		return filterNotificationsByCategory(notifications, category)
	}, [notifications, category])

	const groups = useMemo(() => {
		return groupNotificationsByTime(filteredNotifications)
	}, [filteredNotifications])

	const isEmpty = filteredNotifications.length === 0

	return {
		groups,
		isEmpty,
		isLoading,
		markAsRead,
		markAllAsRead,
		unreadCount,
		totalCount: filteredNotifications.length,
	}
}
