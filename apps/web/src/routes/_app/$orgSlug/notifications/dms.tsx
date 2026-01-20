import { createFileRoute } from "@tanstack/react-router"
import { NotificationList } from "~/components/notifications/notification-list"
import { SectionHeader } from "~/components/ui/section-header"
import { useGroupedNotifications } from "~/hooks/use-grouped-notifications"

export const Route = createFileRoute("/_app/$orgSlug/notifications/dms")({
	component: DirectMessagesRoute,
})

function DirectMessagesRoute() {
	const { groups, isEmpty, isLoading, markAsRead } = useGroupedNotifications("dms")

	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			<SectionHeader.Root className="border-none pb-0">
				<SectionHeader.Group>
					<div className="space-y-0.5">
						<SectionHeader.Heading size="xl">Direct Messages</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Notifications from your direct message conversations.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<NotificationList
				groups={groups}
				isEmpty={isEmpty}
				isLoading={isLoading}
				onMarkAsRead={markAsRead}
				emptyTitle="No DM notifications"
				emptyDescription="Notifications from direct messages will appear here."
			/>
		</div>
	)
}
