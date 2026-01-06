"use client"

import type { Channel, ChannelMember } from "@hazel/db/schema"
import type { ChannelId } from "@hazel/schema"
import { SidebarSection } from "~/components/ui/sidebar"
import { ThreadItem } from "./thread-item"

interface ThreadsSectionProps {
	/** Map of parent channel IDs to their active threads */
	threadsByParent: Map<
		ChannelId,
		Array<{
			channel: Omit<Channel, "updatedAt"> & { updatedAt: Date | null }
			member: ChannelMember
		}>
	>
}

/**
 * Dedicated section for active threads in the sidebar.
 * Flattens all threads from threadsByParent and renders them in a single section.
 */
export function ThreadsSection({ threadsByParent }: ThreadsSectionProps) {
	// Flatten all threads into a single array
	const allThreads = Array.from(threadsByParent.values()).flat()

	// Don't render if no threads
	if (allThreads.length === 0) return null

	return (
		<SidebarSection label="Threads">
			{allThreads.map(({ channel, member }) => (
				<ThreadItem key={channel.id} thread={channel} member={member} />
			))}
		</SidebarSection>
	)
}
