import { createFileRoute } from "@tanstack/react-router"
import { NotificationList } from "~/components/notifications/notification-list"
import { SectionHeader } from "~/components/ui/section-header"
import { useGroupedNotifications } from "~/hooks/use-grouped-notifications"

export const Route = createFileRoute("/_app/$orgSlug/notifications/threads")({
	component: ThreadsRoute,
})

function ThreadsRoute() {
	const { groups, isEmpty, isLoading, markAsRead } = useGroupedNotifications("threads")

	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			<SectionHeader.Root className="border-none pb-0">
				<SectionHeader.Group>
					<div className="space-y-0.5">
						<SectionHeader.Heading size="xl">Threads</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Notifications from thread conversations.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<NotificationList
				groups={groups}
				isEmpty={isEmpty}
				isLoading={isLoading}
				onMarkAsRead={markAsRead}
				emptyTitle="No thread notifications"
				emptyDescription="Notifications from thread conversations will appear here."
			/>
		</div>
	)
}
