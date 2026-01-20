import { createFileRoute } from "@tanstack/react-router"
import { NotificationList } from "~/components/notifications/notification-list"
import { SectionHeader } from "~/components/ui/section-header"
import { useGroupedNotifications } from "~/hooks/use-grouped-notifications"

export const Route = createFileRoute("/_app/$orgSlug/notifications/")({
	component: AllActivityRoute,
})

function AllActivityRoute() {
	const { groups, isEmpty, isLoading, markAsRead } = useGroupedNotifications("all")

	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			<SectionHeader.Root className="border-none pb-0">
				<SectionHeader.Group>
					<div className="space-y-0.5">
						<SectionHeader.Heading size="xl">All Activity</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Stay updated on messages and activity in your channels.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<NotificationList
				groups={groups}
				isEmpty={isEmpty}
				isLoading={isLoading}
				onMarkAsRead={markAsRead}
				emptyTitle="No notifications"
				emptyDescription="You're all caught up! Notifications about messages and activity will appear here."
			/>
		</div>
	)
}
