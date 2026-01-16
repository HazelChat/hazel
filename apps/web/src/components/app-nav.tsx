"use client"

import { IconBellSlash } from "~/components/icons/icon-bell-slash"
import { IconChatBubble } from "~/components/icons/icon-chat-bubble"
import IconUsers from "~/components/icons/icon-users"
import IconMagnifier from "~/components/icons/icon-magnifier-3"
import { Button as PrimitiveButton } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { isTauriMacOS } from "~/lib/tauri"

export function AppNav({ openCmd }: { openCmd: (open: boolean) => void }) {
	const hasTauriTitlebar = isTauriMacOS()

	return (
		<nav
			data-tauri-drag-region
			className={`sticky top-0 flex items-center justify-between border-b bg-bg px-5 py-1.5 ${hasTauriTitlebar ? "pt-5" : ""}`}
		>
			<div className="flex items-center gap-2 font-semibold text-sm/6">
				<SidebarTrigger className="-ml-2 sm:-ml-0.5" />
				<Separator className="mr-1.5 h-4" orientation="vertical" />
				<IconChatBubble className="hidden size-4 sm:inline" /> General
			</div>
			<div className="flex items-center gap-x-1.5">
				<Button onPress={() => openCmd(true)} aria-label="Search...">
					<IconMagnifier />
				</Button>
				<Button aria-label="Threads">
					<IconChatBubble />
				</Button>
				<Button aria-label="Turn off notifications">
					<IconBellSlash />
				</Button>
				<Button aria-label="Members">
					<IconUsers />
				</Button>
			</div>
		</nav>
	)
}

export function Button(props: React.ComponentProps<typeof PrimitiveButton>) {
	return <PrimitiveButton intent="plain" size="sq-sm" isCircle {...props} />
}
