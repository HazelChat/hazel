import type { NotificationId } from "@hazel/schema"
import IconBell from "~/components/icons/icon-bell"
import { EmptyState } from "~/components/ui/empty-state"
import { Loader } from "~/components/ui/loader"
import type { NotificationGroup } from "~/hooks/use-grouped-notifications"
import { NotificationItem } from "./notification-item"

interface NotificationListProps {
	groups: NotificationGroup[]
	isEmpty: boolean
	isLoading: boolean
	onMarkAsRead: (id: NotificationId) => void
	emptyTitle?: string
	emptyDescription?: string
}

export function NotificationList({
	groups,
	isEmpty,
	isLoading,
	onMarkAsRead,
	emptyTitle = "No notifications",
	emptyDescription = "You're all caught up! Notifications will appear here.",
}: NotificationListProps) {
	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center py-16">
				<Loader className="size-8" />
			</div>
		)
	}

	if (isEmpty) {
		return <EmptyState icon={IconBell} title={emptyTitle} description={emptyDescription} />
	}

	return (
		<div className="flex flex-col gap-6">
			{groups.map((group) => (
				<div key={group.label}>
					<div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm px-4 py-2">
						<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
							{group.label}
						</h2>
					</div>
					<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
						<div className="divide-y divide-border">
							{group.notifications.map((notification) => (
								<NotificationItem
									key={notification.notification.id}
									notification={notification}
									onMarkAsRead={onMarkAsRead}
								/>
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	)
}
