import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import IconBell from "~/components/icons/icon-bell"
import { NotificationItem } from "~/components/notifications/notification-item"
import { Button } from "~/components/ui/button"
import { EmptyState } from "~/components/ui/empty-state"
import { Loader } from "~/components/ui/loader"
import { SectionHeader } from "~/components/ui/section-header"
import { Tab, TabList, TabPanel, Tabs } from "~/components/ui/tabs"
import { useNotifications } from "~/hooks/use-notifications"

export const Route = createFileRoute("/_app/$orgSlug/notifications")({
	component: RouteComponent,
})

function RouteComponent() {
	const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications()
	const [isMarkingAll, setIsMarkingAll] = useState(false)

	const unreadNotifications = useMemo(() => {
		return notifications.filter((n) => n.notification.readAt === null)
	}, [notifications])

	const handleMarkAllAsRead = async () => {
		setIsMarkingAll(true)
		try {
			await markAllAsRead()
		} finally {
			setIsMarkingAll(false)
		}
	}

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader className="size-8" />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-6 p-6 lg:p-12">
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="space-y-0.5">
						<SectionHeader.Heading>Notifications</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Stay updated on messages and activity in your channels.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
				{unreadCount > 0 && (
					<SectionHeader.Actions>
						<Button
							intent="outline"
							size="sm"
							onPress={handleMarkAllAsRead}
							isPending={isMarkingAll}
						>
							Mark all as read
						</Button>
					</SectionHeader.Actions>
				)}
			</SectionHeader.Root>

			<Tabs defaultSelectedKey="all">
				<TabList className="w-full">
					<Tab id="all">
						<span className="flex items-center gap-2">
							All
							{notifications.length > 0 && (
								<span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-fg text-xs">
									{notifications.length}
								</span>
							)}
						</span>
					</Tab>
					<Tab id="unread">
						<span className="flex items-center gap-2">
							Unread
							{unreadCount > 0 && (
								<span className="rounded-full bg-primary px-2 py-0.5 font-medium text-primary-fg text-xs">
									{unreadCount}
								</span>
							)}
						</span>
					</Tab>
				</TabList>

				<TabPanel id="all">
					{notifications.length > 0 ? (
						<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
							<h2 className="sr-only">All Notifications</h2>
							<div className="divide-y divide-border">
								{notifications.map((notification) => (
									<NotificationItem
										key={notification.notification.id}
										notification={notification}
										onMarkAsRead={markAsRead}
									/>
								))}
							</div>
						</div>
					) : (
						<EmptyState
							icon={IconBell}
							title="No notifications"
							description="You're all caught up! Notifications about messages and activity will appear here."
						/>
					)}
				</TabPanel>

				<TabPanel id="unread">
					{unreadNotifications.length > 0 ? (
						<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
							<h2 className="sr-only">Unread Notifications</h2>
							<div className="divide-y divide-border">
								{unreadNotifications.map((notification) => (
									<NotificationItem
										key={notification.notification.id}
										notification={notification}
										onMarkAsRead={markAsRead}
									/>
								))}
							</div>
						</div>
					) : (
						<EmptyState
							icon={IconBell}
							title="No unread notifications"
							description="You've read all your notifications. New ones will appear here."
						/>
					)}
				</TabPanel>
			</Tabs>
		</div>
	)
}
