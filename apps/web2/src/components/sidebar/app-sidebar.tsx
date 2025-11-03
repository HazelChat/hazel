import { ChannelsSidebar } from "~/components/sidebar/channels-sidebar"
import { NavSidebar } from "~/components/sidebar/nav-sidebar"
import { Sidebar } from "~/components/ui/sidebar"

export function AppSidebar(props: { openChannelsBrowser: () => void }) {
	return (
		<Sidebar
			closeButton={false}
			collapsible="dock"
			className="overflow-hidden *:data-[sidebar=default]:flex-row"
		>
			<NavSidebar />

			<ChannelsSidebar openChannelsBrowser={props.openChannelsBrowser} />
		</Sidebar>
	)
}
