import { useAtomSet } from "@effect-atom/atom-react"
import type { Channel, ExternalChannelLink } from "@hazel/domain/models"
import type { ChannelId, OrganizationId } from "@hazel/schema"
import { useState } from "react"
import { createExternalChannelLinkMutation } from "~/atoms/external-channel-link-atoms"
import IconHashtag from "~/components/icons/icon-hashtag"
import { Button } from "~/components/ui/button"
import { Description, Label } from "~/components/ui/field"
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "~/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select"
import { TextField } from "~/components/ui/text-field"
import { useAuth } from "~/lib/auth"
import { exitToastAsync } from "~/lib/toast-exit"
import { SyncDirectionSelect } from "./sync-direction-select"

type SyncDirection = ExternalChannelLink.SyncDirection

interface DiscordChannel {
	id: string
	name: string
	type: number
	parentId: string | null
}

interface AddChannelMappingModalProps {
	organizationId: OrganizationId
	discordChannels: DiscordChannel[]
	hazelChannels: (typeof Channel.Model.Type)[]
	existingMappings: { externalChannelId: string; channelId: string }[]
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	onMappingCreated: () => void
}

export function AddChannelMappingModal({
	organizationId,
	discordChannels,
	hazelChannels,
	existingMappings,
	isOpen,
	onOpenChange,
	onMappingCreated,
}: AddChannelMappingModalProps) {
	const { user } = useAuth()
	const [selectedDiscord, setSelectedDiscord] = useState<string | null>(null)
	const [selectedHazel, setSelectedHazel] = useState<string | null>(null)
	const [syncDirection, setSyncDirection] = useState<SyncDirection>("bidirectional")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const createLink = useAtomSet(createExternalChannelLinkMutation, { mode: "promiseExit" })

	// Filter out already-mapped channels
	const existingDiscordIds = new Set(existingMappings.map((m) => m.externalChannelId))
	const existingHazelIds = new Set(existingMappings.map((m) => m.channelId))

	const availableDiscordChannels = discordChannels.filter((ch) => !existingDiscordIds.has(ch.id))
	const availableHazelChannels = hazelChannels.filter((ch) => !existingHazelIds.has(ch.id))

	const selectedDiscordChannel = discordChannels.find((ch) => ch.id === selectedDiscord)

	const handleClose = () => {
		onOpenChange(false)
		// Reset state after animation completes
		setTimeout(() => {
			setSelectedDiscord(null)
			setSelectedHazel(null)
			setSyncDirection("bidirectional")
		}, 200)
	}

	const handleSubmit = async () => {
		if (!selectedDiscord || !selectedHazel || !user?.id) return

		const discordChannel = discordChannels.find((ch) => ch.id === selectedDiscord)
		if (!discordChannel) return

		setIsSubmitting(true)

		await exitToastAsync(
			createLink({
				payload: {
					channelId: selectedHazel as ChannelId,
					organizationId,
					provider: "discord",
					externalWorkspaceId: "discord-server", // TODO: Get actual server ID from connection
					externalWorkspaceName: "Discord Server", // TODO: Get actual server name from connection
					externalChannelId: discordChannel.id,
					externalChannelName: discordChannel.name,
					syncDirection,
					config: { provider: "discord" },
					isEnabled: true,
				},
			}),
		)
			.loading("Creating mapping...")
			.onSuccess(() => {
				onMappingCreated()
				handleClose()
			})
			.successMessage("Channel mapping created")
			.onErrorTag("ExternalLinkAlreadyExistsError", () => ({
				title: "Mapping already exists",
				description: "This channel pair is already mapped.",
				isRetryable: false,
			}))
			.onErrorTag("ChannelNotFoundError", () => ({
				title: "Channel not found",
				description: "The Hazel channel may have been deleted.",
				isRetryable: false,
			}))
			.run()

		setIsSubmitting(false)
	}

	const canSubmit = selectedDiscord && selectedHazel && !isSubmitting

	return (
		<Modal isOpen={isOpen} onOpenChange={handleClose}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Add Channel Mapping</ModalTitle>
					<ModalDescription>
						Connect a Discord channel to a Hazel channel to sync messages
					</ModalDescription>
				</ModalHeader>
				<ModalBody className="space-y-4">
					{/* Discord Channel Select */}
					<TextField>
						<Label>Discord Channel</Label>
						<Select
							selectedKey={selectedDiscord}
							onSelectionChange={(key) => setSelectedDiscord(key as string)}
							placeholder="Select a Discord channel"
						>
							<SelectTrigger />
							<SelectContent>
								{availableDiscordChannels.map((ch) => (
									<SelectItem key={ch.id} id={ch.id} textValue={ch.name}>
										<div className="flex items-center gap-2">
											<img
												src="https://cdn.brandfetch.io/discord.com/w/512/h/512/theme/dark/symbol"
												alt=""
												className="size-4 object-contain"
											/>
											<span>#{ch.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{availableDiscordChannels.length === 0 && (
							<Description className="text-warning-fg">
								All Discord channels have been mapped
							</Description>
						)}
					</TextField>

					{/* Hazel Channel Select */}
					<TextField>
						<Label>Hazel Channel</Label>
						<Select
							selectedKey={selectedHazel}
							onSelectionChange={(key) => setSelectedHazel(key as string)}
							placeholder="Select a Hazel channel"
						>
							<SelectTrigger />
							<SelectContent>
								{availableHazelChannels.map((ch) => (
									<SelectItem key={ch.id} id={ch.id} textValue={ch.name}>
										<div className="flex items-center gap-2">
											<IconHashtag className="size-4 text-muted-fg" />
											<span>#{ch.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{availableHazelChannels.length === 0 && (
							<Description className="text-warning-fg">
								All Hazel channels have been mapped
							</Description>
						)}
					</TextField>

					{/* Sync Direction */}
					<TextField>
						<Label>Sync Direction</Label>
						<SyncDirectionSelect value={syncDirection} onChange={setSyncDirection} />
						<Description>Choose how messages should be synchronized between channels</Description>
					</TextField>
				</ModalBody>
				<ModalFooter>
					<Button intent="outline" onPress={handleClose} type="button">
						Cancel
					</Button>
					<Button intent="primary" onPress={handleSubmit} isDisabled={!canSubmit}>
						{isSubmitting ? "Creating..." : "Add Mapping"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
