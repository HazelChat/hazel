import { useMatchRoute, useParams } from "@tanstack/react-router"
import { ChannelsSidebar } from "~/components/sidebar/channels-sidebar"
import { MySettingsSidebar } from "~/components/sidebar/my-settings-sidebar"
import { NavSidebar } from "~/components/sidebar/nav-sidebar"
import { NotificationsSidebar } from "~/components/sidebar/notifications-sidebar"
import { SettingsSidebar } from "~/components/sidebar/settings-sidebar"
import { Sidebar } from "~/components/ui/sidebar"

export function AppSidebar(props: { openChannelsBrowser: () => void }) {
	const matchRoute = useMatchRoute()
	const params = useParams({ strict: false }) as { orgSlug?: string }
	const orgSlug = params.orgSlug || ""
	const isSettingsRoute = !!matchRoute({ to: "/$orgSlug/settings", params: { orgSlug }, fuzzy: true })
	const isMySettingsRoute = !!matchRoute({
		to: "/$orgSlug/my-settings",
		params: { orgSlug },
		fuzzy: true,
	})
	const isNotificationsRoute = !!matchRoute({
		to: "/$orgSlug/notifications",
		params: { orgSlug },
		fuzzy: true,
	})

	return (
		<Sidebar
			closeButton={false}
			collapsible="dock"
			className="overflow-hidden *:data-[sidebar=default]:flex-row"
		>
			<NavSidebar />

			{isNotificationsRoute ? (
				<NotificationsSidebar />
			) : isSettingsRoute ? (
				<SettingsSidebar />
			) : isMySettingsRoute ? (
				<MySettingsSidebar />
			) : (
				<ChannelsSidebar openChannelsBrowser={props.openChannelsBrowser} />
			)}
		</Sidebar>
	)
}
