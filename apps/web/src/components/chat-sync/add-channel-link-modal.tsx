import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { Channel } from "@hazel/domain/models"
import type { ChannelId, ExternalChannelId, OrganizationId, SyncConnectionId } from "@hazel/schema"
import { eq, or, useLiveQuery } from "@tanstack/react-db"
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react"
import IconHashtag from "~/components/icons/icon-hashtag"
import { Button } from "~/components/ui/button"
import { Description, Label } from "~/components/ui/field"
import { Input, InputGroup } from "~/components/ui/input"
import {
	Modal,
	ModalBody,
	ModalClose,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "~/components/ui/modal"
import { channelCollection } from "~/db/collections"
import { HazelApiClient } from "~/lib/services/common/atom-client"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"
import { exitToast } from "~/lib/toast-exit"

type ChannelData = typeof Channel.Model.Type
type SyncDirection = "both" | "hazel_to_external" | "external_to_hazel"
type ChatSyncProvider = "discord" | "slack"

interface ExternalWorkspaceChannel {
	id: ExternalChannelId
	name: string
}

const PROVIDER_LABELS: Record<ChatSyncProvider, string> = {
	discord: "Discord",
	slack: "Slack",
}

const DIRECTION_OPTIONS = (
	providerLabel: string,
): {
	value: SyncDirection
	label: string
	description: string
	icon: ReactNode
}[] => [
	{
		value: "both",
		label: "Both directions",
		description: "Messages sync both ways",
		icon: (
			<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
				/>
			</svg>
		),
	},
	{
		value: "hazel_to_external",
		label: `Hazel to ${providerLabel}`,
		description: `Only send messages to ${providerLabel}`,
		icon: (
			<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
			</svg>
		),
	},
	{
		value: "external_to_hazel",
		label: `${providerLabel} to Hazel`,
		description: `Only receive messages from ${providerLabel}`,
		icon: (
			<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
			</svg>
		),
	},
]

interface AddChannelLinkModalProps {
	syncConnectionId: SyncConnectionId
	organizationId: OrganizationId
	externalWorkspaceId: string
	provider: ChatSyncProvider
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

export function AddChannelLinkModal({
	syncConnectionId,
	organizationId,
	externalWorkspaceId,
	provider,
	isOpen,
	onClose,
	onSuccess,
}: AddChannelLinkModalProps) {
	const providerLabel = PROVIDER_LABELS[provider]
	const directionOptions = DIRECTION_OPTIONS(providerLabel)

	const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null)
	const [selectedExternalChannel, setSelectedExternalChannel] = useState<ExternalWorkspaceChannel | null>(
		null,
	)
	const [direction, setDirection] = useState<SyncDirection>("both")
	const [channelSearch, setChannelSearch] = useState("")
	const [externalChannelSearch, setExternalChannelSearch] = useState("")
	const [isCreating, setIsCreating] = useState(false)

	const { data: channelsData } = useLiveQuery(
		(q) =>
			q
				.from({ channel: channelCollection })
				.where(({ channel }) => eq(channel.organizationId, organizationId))
				.where(({ channel }) => or(eq(channel.type, "public"), eq(channel.type, "private")))
				.select(({ channel }) => ({ ...channel })),
		[organizationId],
	)
	const channels = channelsData ?? []

	const discordChannelsResult = useAtomValue(
		HazelApiClient.query("integration-resources", "getDiscordGuildChannels", {
			path: { orgId: organizationId, guildId: externalWorkspaceId },
		}),
	)

	const slackChannelsResult = useAtomValue(
		HazelApiClient.query("integration-resources", "getSlackChannels", {
			path: { orgId: organizationId, workspaceId: externalWorkspaceId },
		}),
	)

	const filteredChannels = useMemo(() => {
		if (!channelSearch.trim()) return channels
		const search = channelSearch.toLowerCase()
		return channels.filter((c) => c.name.toLowerCase().includes(search))
	}, [channels, channelSearch])

	const externalChannels = useMemo<ExternalWorkspaceChannel[]>(() => {
		if (provider === "discord") {
			return Result.builder(discordChannelsResult)
				.onSuccess((data) =>
					(data?.channels ?? []).map((channel) => ({ id: channel.id, name: channel.name })),
				)
				.orElse(() => [])
		}

		return Result.builder(slackChannelsResult)
			.onSuccess((data) =>
				(data?.channels ?? []).map((channel) => ({ id: channel.id, name: channel.name })),
			)
			.orElse(() => [])
	}, [provider, discordChannelsResult, slackChannelsResult])

	const isExternalChannelsLoading =
		provider === "discord"
			? Result.isInitial(discordChannelsResult)
			: Result.isInitial(slackChannelsResult)
	const isExternalChannelsFailure =
		provider === "discord"
			? Result.isFailure(discordChannelsResult)
			: Result.isFailure(slackChannelsResult)
	const isExternalChannelsReady =
		provider === "discord"
			? Result.isSuccess(discordChannelsResult)
			: Result.isSuccess(slackChannelsResult)

	const filteredExternalChannels = useMemo(() => {
		if (!externalChannelSearch.trim()) return externalChannels
		const search = externalChannelSearch.toLowerCase()
		return externalChannels.filter((channel) => channel.name.toLowerCase().includes(search))
	}, [externalChannels, externalChannelSearch])

	const createChannelLink = useAtomSet(HazelRpcClient.mutation("chatSync.channelLink.create"), {
		mode: "promiseExit",
	})

	const handleClose = () => {
		setSelectedChannel(null)
		setSelectedExternalChannel(null)
		setDirection("both")
		setChannelSearch("")
		setExternalChannelSearch("")
		onClose()
	}

	const handleSubmit = async () => {
		if (!selectedChannel || !selectedExternalChannel) return
		setIsCreating(true)

		const exit = await createChannelLink({
			payload: {
				syncConnectionId,
				hazelChannelId: selectedChannel.id as ChannelId,
				externalChannelId: selectedExternalChannel.id,
				externalChannelName: selectedExternalChannel.name,
				direction,
			},
		})

		exitToast(exit)
			.onSuccess(() => {
				onSuccess()
				handleClose()
			})
			.successMessage(`Linked #${selectedChannel.name} to #${selectedExternalChannel.name}`)
			.onErrorTag("ChatSyncConnectionNotFoundError", () => ({
				title: "Connection not found",
				description: "This sync connection may have been deleted.",
				isRetryable: false,
			}))
			.onErrorTag("ChatSyncChannelLinkExistsError", () => ({
				title: "Link already exists",
				description: "This channel pair is already linked.",
				isRetryable: false,
			}))
			.run()

		setIsCreating(false)
	}

	const isValid = !!selectedChannel && !!selectedExternalChannel

	return (
		<Modal>
			<ModalContent isOpen={isOpen} onOpenChange={(open) => !open && handleClose()} size="lg">
				<ModalHeader>
					<ModalTitle>Link Channel</ModalTitle>
				</ModalHeader>

				<ModalBody className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<Label>Hazel Channel</Label>
						{selectedChannel ? (
							<div className="flex items-center justify-between rounded-lg border border-border bg-bg-muted/30 px-3 py-2.5">
								<div className="flex items-center gap-2">
									<IconHashtag className="size-4 text-muted-fg" />
									<span className="font-medium text-fg text-sm">
										{selectedChannel.name}
									</span>
								</div>
								<button
									type="button"
									onClick={() => setSelectedChannel(null)}
									className="text-muted-fg text-xs transition-colors hover:text-fg"
								>
									Change
								</button>
							</div>
						) : (
							<div className="flex flex-col gap-2">
								<InputGroup>
									<Input
										placeholder="Search channels..."
										value={channelSearch}
										onChange={(e: ChangeEvent<HTMLInputElement>) =>
											setChannelSearch(e.target.value)
										}
										autoFocus
									/>
								</InputGroup>
								<div className="max-h-48 overflow-y-auto rounded-lg border border-border">
									{filteredChannels.length === 0 ? (
										<div className="px-3 py-6 text-center text-muted-fg text-sm">
											No channels found
										</div>
									) : (
										filteredChannels.map((channel) => (
											<button
												key={channel.id}
												type="button"
												onClick={() => {
													setSelectedChannel(channel)
													setChannelSearch("")
												}}
												className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/50"
											>
												<IconHashtag className="size-4 shrink-0 text-muted-fg" />
												<span className="truncate text-fg">{channel.name}</span>
											</button>
										))
									)}
								</div>
							</div>
						)}
					</div>

					<div className="flex flex-col gap-2">
						<Label>{providerLabel} Channel</Label>
						{isExternalChannelsLoading && (
							<div className="flex items-center justify-center rounded-lg border border-border p-6">
								<div className="flex items-center gap-3 text-muted-fg">
									<div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
									<span className="text-sm">Loading {providerLabel} channels...</span>
								</div>
							</div>
						)}
						{isExternalChannelsFailure && (
							<div className="rounded-lg border border-border bg-bg-muted/20 p-4">
								<p className="font-medium text-fg text-sm">
									Could not load {providerLabel} channels
								</p>
								<p className="mt-1 text-muted-fg text-sm">
									Make sure this workspace is connected and the bot has channel access.
								</p>
							</div>
						)}
						{isExternalChannelsReady && (
							<>
								{selectedExternalChannel ? (
									<div className="flex items-center justify-between rounded-lg border border-border bg-bg-muted/30 px-3 py-2.5">
										<div className="flex items-center gap-2">
											<IconHashtag className="size-4 text-muted-fg" />
											<span className="font-medium text-fg text-sm">
												{selectedExternalChannel.name}
											</span>
										</div>
										<button
											type="button"
											onClick={() => setSelectedExternalChannel(null)}
											className="text-muted-fg text-xs transition-colors hover:text-fg"
										>
											Change
										</button>
									</div>
								) : (
									<div className="flex flex-col gap-2">
										<InputGroup>
											<Input
												placeholder={`Search ${providerLabel} channels...`}
												value={externalChannelSearch}
												onChange={(e: ChangeEvent<HTMLInputElement>) =>
													setExternalChannelSearch(e.target.value)
												}
											/>
										</InputGroup>
										<div className="max-h-48 overflow-y-auto rounded-lg border border-border">
											{filteredExternalChannels.length === 0 ? (
												<div className="px-3 py-6 text-center text-muted-fg text-sm">
													No {providerLabel} channels found
												</div>
											) : (
												filteredExternalChannels.map((channel) => (
													<button
														key={channel.id}
														type="button"
														onClick={() => {
															setSelectedExternalChannel(channel)
															setExternalChannelSearch("")
														}}
														className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/50"
													>
														<IconHashtag className="size-4 shrink-0 text-muted-fg" />
														<span className="truncate text-fg">
															{channel.name}
														</span>
													</button>
												))
											)}
										</div>
									</div>
								)}
								<Description>
									Select the {providerLabel} channel from the connected workspace.
								</Description>
							</>
						)}
					</div>

					<div className="flex flex-col gap-2">
						<Label>Sync Direction</Label>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
							{directionOptions.map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => setDirection(option.value)}
									className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all ${
										direction === option.value
											? "border-primary bg-primary/5 text-primary"
											: "border-border text-muted-fg hover:border-border-hover hover:bg-bg-muted/30"
									}`}
								>
									{option.icon}
									<div className="space-y-0.5">
										<p className="font-medium text-xs">{option.label}</p>
										<p className="text-[10px] leading-tight opacity-70">
											{option.description}
										</p>
									</div>
								</button>
							))}
						</div>
					</div>
				</ModalBody>

				<ModalFooter>
					<ModalClose intent="secondary">Cancel</ModalClose>
					<Button
						intent="primary"
						onPress={handleSubmit}
						isDisabled={!isValid || isCreating || !isExternalChannelsReady}
						isPending={isCreating}
					>
						{isCreating ? "Linking..." : "Link Channel"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
