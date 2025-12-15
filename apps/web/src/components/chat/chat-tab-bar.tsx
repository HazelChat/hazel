import type { Key } from "react-aria-components"
import { IconFolders } from "~/components/icons/icon-folder"
import IconMsgs from "~/components/icons/icon-msgs"
import { Tab, TabList, Tabs } from "~/components/ui/tabs"

export type ChatTab = "messages" | "files"

interface ChatTabBarProps {
	activeTab: ChatTab
	onTabChange: (tab: ChatTab) => void
}

export function ChatTabBar({ activeTab, onTabChange }: ChatTabBarProps) {
	const handleSelectionChange = (key: Key) => {
		onTabChange(key as ChatTab)
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
