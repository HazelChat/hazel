import { useMatchRoute, useParams } from "@tanstack/react-router"
import { ChannelsSidebar } from "~/components/sidebar/channels-sidebar"
import { NavSidebar } from "~/components/sidebar/nav-sidebar"
import { SettingsSidebar } from "~/components/sidebar/settings-sidebar"
import { Sidebar } from "~/components/ui/sidebar"

export function AppSidebar(props: { openChannelsBrowser: () => void }) {
	const matchRoute = useMatchRoute()
	const params = useParams({ strict: false }) as { orgSlug?: string }
	const orgSlug = params.orgSlug || ""
	const isSettingsRoute = !!matchRoute({ to: "/$orgSlug/settings", params: { orgSlug }, fuzzy: true })

	return (
		<Sidebar
			closeButton={false}
			collapsible="dock"
			className="overflow-hidden *:data-[sidebar=default]:flex-row"
		>
			<NavSidebar />

			{isSettingsRoute ? (
				<SettingsSidebar />
			) : (
				<ChannelsSidebar openChannelsBrowser={props.openChannelsBrowser} />
			)}
		</Sidebar>
	)
}
