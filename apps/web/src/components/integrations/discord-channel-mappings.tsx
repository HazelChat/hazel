import { useAtomSet } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { and, eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { useCallback, useEffect, useRef, useState } from "react"
import {
	listExternalChannelLinksByOrgMutation,
	type ExternalChannelLinkData,
} from "~/atoms/external-channel-link-atoms"
import IconPlus from "~/components/icons/icon-plus"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Loader } from "~/components/ui/loader"
import { channelCollection } from "~/db/collections"
import { useDiscordChannels } from "~/hooks/use-discord-channels"
import { exitToast } from "~/lib/toast-exit"
import { AddChannelMappingModal } from "./add-channel-mapping-modal"
import { ChannelMappingRow } from "./channel-mapping-row"

interface DiscordChannelMappingsProps {
	organizationId: OrganizationId
	guildId: string | null
}

export function DiscordChannelMappings({ organizationId, guildId }: DiscordChannelMappingsProps) {
	const [links, setLinks] = useState<ExternalChannelLinkData[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isModalOpen, setIsModalOpen] = useState(false)

	// Fetch Discord channels from the connected guild
	const { channels: discordChannels, isLoading: isLoadingChannels } = useDiscordChannels(
		organizationId,
		guildId,
	)

	// Fetch Hazel channels for this organization (non-thread channels only)
	const { data: hazelChannels } = useLiveQuery(
		(q) =>
			q
				.from({ channel: channelCollection })
				.where(({ channel }) =>
					and(eq(channel.organizationId, organizationId), isNull(channel.parentChannelId)),
				)
				.orderBy(({ channel }) => channel.name, "asc"),
		[organizationId],
	)

	// List external channel links mutation
	const listLinks = useAtomSet(listExternalChannelLinksByOrgMutation, { mode: "promiseExit" })
	const listLinksRef = useRef(listLinks)
	listLinksRef.current = listLinks

	const fetchLinks = useCallback(async () => {
		setIsLoading(true)
		const exit = await listLinksRef.current({
			payload: { organizationId },
		})

		exitToast(exit)
			.onSuccess((result) => setLinks(result.data as unknown as ExternalChannelLinkData[]))
			.run()
		setIsLoading(false)
	}, [organizationId])

	useEffect(() => {
		fetchLinks()
	}, [fetchLinks])

	// Create a map of channelId -> channel name for quick lookup
	const channelNameMap = new Map<string, string>()
	hazelChannels?.forEach((ch) => {
		channelNameMap.set(ch.id, ch.name)
	})

	// Filter only Discord links
	const discordLinks = links.filter((link) => link.provider === "discord")

	// Create existing mappings for the modal
	const existingMappings = discordLinks.map((link) => ({
		externalChannelId: link.externalChannelId,
		channelId: link.channelId,
	}))

	return (
		<div className="min-w-0 overflow-hidden rounded-xl border border-border bg-bg">
			<div className="flex items-center justify-between border-border border-b bg-bg-muted/30 px-5 py-3">
				<div className="flex items-center gap-2">
					<h3 className="font-semibold text-fg text-sm">Channel Mappings</h3>
					{discordLinks.length > 0 && (
						<Badge intent="secondary" size="sm">
							{discordLinks.length}
						</Badge>
					)}
				</div>
				<Button intent="secondary" size="sm" onPress={() => setIsModalOpen(true)}>
					<IconPlus className="size-4" />
					Add Mapping
				</Button>
			</div>

			<div className="p-4">
				{isLoading || isLoadingChannels ? (
					<div className="flex items-center justify-center py-8">
						<Loader className="size-5" />
					</div>
				) : discordLinks.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8">
						<div className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary">
							<img
								src="https://cdn.brandfetch.io/discord.com/w/32/h/32/theme/dark/symbol"
								alt="Discord"
								className="size-6"
							/>
						</div>
						<p className="mb-1 font-medium text-fg">No channel mappings</p>
						<p className="mb-4 text-center text-muted-fg text-sm">
							Create a mapping to sync messages between Discord and Hazel channels
						</p>
						<Button intent="primary" size="sm" onPress={() => setIsModalOpen(true)}>
							<IconPlus className="size-4" />
							Add Channel Mapping
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						{discordLinks.map((link) => (
							<ChannelMappingRow
								key={link.id}
								link={link}
								hazelChannelName={channelNameMap.get(link.channelId) ?? "Unknown"}
								onLinkChange={fetchLinks}
							/>
						))}
					</div>
				)}
			</div>

			<AddChannelMappingModal
				organizationId={organizationId}
				discordChannels={discordChannels}
				hazelChannels={hazelChannels ?? []}
				existingMappings={existingMappings}
				isOpen={isModalOpen}
				onOpenChange={setIsModalOpen}
				onMappingCreated={fetchLinks}
			/>
		</div>
	)
}
