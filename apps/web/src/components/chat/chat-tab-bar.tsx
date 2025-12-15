import type { ChannelId } from "@hazel/schema"
import { useLocation, useNavigate } from "@tanstack/react-router"
import type { Key } from "react-aria-components"
import { IconFolders } from "~/components/icons/icon-folder"
import IconMsgs from "~/components/icons/icon-msgs"
import { Tab, TabList, Tabs } from "~/components/ui/tabs"

export type ChatTab = "messages" | "files"

interface ChatTabBarProps {
	orgSlug: string
	channelId: ChannelId
}

export function ChatTabBar({ orgSlug, channelId }: ChatTabBarProps) {
	const location = useLocation()
	const navigate = useNavigate()

	// Determine active tab from pathname
	const isFilesRoute = location.pathname.endsWith("/files")
	const activeTab: ChatTab = isFilesRoute ? "files" : "messages"

	const handleSelectionChange = (key: Key | null) => {
		if (!key) return

		const tabId = key as ChatTab
		if (tabId === "files") {
			navigate({
				to: "/$orgSlug/chat/$id/files",
				params: { orgSlug, id: channelId },
			})
		} else {
			navigate({
				to: "/$orgSlug/chat/$id",
				params: { orgSlug, id: channelId },
			})
		}
	}

	return (
		<Tabs selectedKey={activeTab} onSelectionChange={handleSelectionChange}>
			<TabList className="px-4">
				<Tab id="messages">
					<IconMsgs data-slot="icon" className="size-4" />
					Messages
				</Tab>
				<Tab id="files">
					<IconFolders data-slot="icon" className="size-4" />
					Files
				</Tab>
			</TabList>
		</Tabs>
	)
}
