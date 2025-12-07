import type { Channel } from "@hazel/domain/models"
import type { ChannelId } from "@hazel/schema"
import { useEffect, useState } from "react"
import type { WebhookData } from "~/atoms/channel-webhook-atoms"
import { OpenStatusSection } from "~/components/channel-settings/openstatus-section"
import { getProviderIconUrl } from "~/components/embeds/use-embed-theme"
import IconHashtag from "~/components/icons/icon-hashtag"
import { Button } from "~/components/ui/button"
import { Description } from "~/components/ui/field"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select"

type ChannelData = typeof Channel.Model.Type

interface ConfigureOpenStatusModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	channels: ChannelData[]
	selectedChannelId: ChannelId | null
	existingWebhook: WebhookData | null
	onSuccess: () => void
	onWebhookCreated?: (data: { webhookId: string; token: string; channelId: ChannelId }) => void
}

export function ConfigureOpenStatusModal({
	isOpen,
	onOpenChange,
	channels,
	selectedChannelId: initialChannelId,
	existingWebhook,
	onSuccess,
	onWebhookCreated,
}: ConfigureOpenStatusModalProps) {
	const [selectedChannelId, setSelectedChannelId] = useState<ChannelId | null>(initialChannelId)
	const [webhook, setWebhook] = useState<WebhookData | null>(existingWebhook)

	// Sync state when modal opens with new props
	useEffect(() => {
		if (isOpen) {
			setSelectedChannelId(initialChannelId)
			setWebhook(existingWebhook)
		}
	}, [isOpen, initialChannelId, existingWebhook])

	const selectedChannel = channels.find((c) => c.id === selectedChannelId)

	const handleWebhookChange = (operation: "create" | "delete") => {
		if (operation === "delete") {
			onSuccess()
			onOpenChange(false)
		}
		// For create/update, don't refresh yet - it causes remount and state loss
		// Refresh will happen when modal closes via handleDone or handleClose
	}

	const handleDone = () => {
		onSuccess()
		onOpenChange(false)
	}

	const handleClose = () => {
		onSuccess() // Refresh list when closing
		onOpenChange(false)
		setSelectedChannelId(initialChannelId)
		setWebhook(existingWebhook)
	}

	const handleWebhookCreated = (data: { webhookId: string; token: string }) => {
		if (selectedChannelId && onWebhookCreated) {
			onWebhookCreated({ ...data, channelId: selectedChannelId })
		}
		onSuccess()
		onOpenChange(false)
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg">
				<ModalHeader>
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-secondary/50">
							<img
								src={getProviderIconUrl("openstatus")}
								alt="OpenStatus"
								className="size-6 rounded"
							/>
						</div>
						<div>
							<ModalTitle>
								{existingWebhook ? "Manage OpenStatus" : "Add OpenStatus to Channel"}
							</ModalTitle>
							<Description>
								{existingWebhook
									? `Configure OpenStatus for #${selectedChannel?.name ?? "channel"}`
									: "Select a channel to receive monitor alerts"}
							</Description>
						</div>
					</div>
				</ModalHeader>

				<ModalBody className="flex flex-col gap-6">
					{!existingWebhook && (
						<div>
							<span className="mb-2 block font-medium text-fg text-sm">Channel</span>
							<Select
								aria-label="Select a channel"
								selectedKey={selectedChannelId}
								onSelectionChange={(key) => setSelectedChannelId(key as ChannelId)}
								placeholder="Select a channel..."
							>
								<SelectTrigger prefix={<IconHashtag className="size-4 text-muted-fg" />} />
								<SelectContent>
									{channels.map((channel) => (
										<SelectItem key={channel.id} id={channel.id} textValue={channel.name}>
											{channel.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{selectedChannelId && (
						<OpenStatusSection
							channelId={selectedChannelId}
							webhook={webhook}
							onWebhookChange={handleWebhookChange}
							onDone={handleDone}
							variant="modal"
							onWebhookCreated={handleWebhookCreated}
						/>
					)}

					{!selectedChannelId && !existingWebhook && (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-bg-muted">
								<IconHashtag className="size-8 text-muted-fg" />
							</div>
							<p className="text-muted-fg text-sm">
								Select a channel above to configure OpenStatus alerts
							</p>
						</div>
					)}
				</ModalBody>

				<ModalFooter>
					<Button intent="outline" onPress={handleClose}>
						{existingWebhook ? "Done" : "Cancel"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
