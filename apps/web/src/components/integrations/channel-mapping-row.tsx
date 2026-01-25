import { useAtomSet } from "@effect-atom/atom-react"
import type { ExternalChannelLink } from "@hazel/domain/models"
import type { ExternalChannelLinkId } from "@hazel/schema"
import { useState } from "react"
import {
	deleteExternalChannelLinkMutation,
	type ExternalChannelLinkData,
	updateExternalChannelLinkMutation,
} from "~/atoms/external-channel-link-atoms"
import IconCirclePause from "~/components/icons/icon-circle-pause"
import IconDotsVertical from "~/components/icons/icon-dots-vertical"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconPlay from "~/components/icons/icon-play"
import IconTrash from "~/components/icons/icon-trash"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from "~/components/ui/menu"
import { Switch } from "~/components/ui/switch"
import { exitToast } from "~/lib/toast-exit"
import { SyncDirectionSelect } from "./sync-direction-select"

type SyncDirection = ExternalChannelLink.SyncDirection

interface ChannelMappingRowProps {
	link: ExternalChannelLinkData
	hazelChannelName: string
	onLinkChange: () => void
}

export function ChannelMappingRow({ link, hazelChannelName, onLinkChange }: ChannelMappingRowProps) {
	const [isDeleting, setIsDeleting] = useState(false)
	const [isToggling, setIsToggling] = useState(false)
	const [isUpdatingDirection, setIsUpdatingDirection] = useState(false)

	const updateLink = useAtomSet(updateExternalChannelLinkMutation, { mode: "promiseExit" })
	const deleteLink = useAtomSet(deleteExternalChannelLinkMutation, { mode: "promiseExit" })

	const handleToggleEnabled = async () => {
		setIsToggling(true)
		const exit = await updateLink({
			payload: {
				id: link.id as ExternalChannelLinkId,
				isEnabled: !link.isEnabled,
			},
		})

		exitToast(exit)
			.onSuccess(() => onLinkChange())
			.successMessage(link.isEnabled ? "Mapping disabled" : "Mapping enabled")
			.onErrorTag("ExternalChannelLinkNotFoundError", () => ({
				title: "Mapping not found",
				description: "This mapping may have been deleted.",
				isRetryable: false,
			}))
			.run()
		setIsToggling(false)
	}

	const handleDirectionChange = async (direction: SyncDirection) => {
		if (direction === link.syncDirection) return

		setIsUpdatingDirection(true)
		const exit = await updateLink({
			payload: {
				id: link.id as ExternalChannelLinkId,
				syncDirection: direction,
			},
		})

		exitToast(exit)
			.onSuccess(() => onLinkChange())
			.successMessage("Sync direction updated")
			.onErrorTag("ExternalChannelLinkNotFoundError", () => ({
				title: "Mapping not found",
				description: "This mapping may have been deleted.",
				isRetryable: false,
			}))
			.run()
		setIsUpdatingDirection(false)
	}

	const handleDelete = async () => {
		setIsDeleting(true)
		const exit = await deleteLink({
			payload: { id: link.id as ExternalChannelLinkId },
		})

		exitToast(exit)
			.onSuccess(() => onLinkChange())
			.successMessage("Mapping deleted")
			.onErrorTag("ExternalChannelLinkNotFoundError", () => ({
				title: "Mapping not found",
				description: "This mapping may have already been deleted.",
				isRetryable: false,
			}))
			.run()
		setIsDeleting(false)
	}

	const discordChannelName = link.externalChannelName || "Unknown channel"
	const discordServerName = link.externalWorkspaceName || "Discord"

	return (
		<div className="flex items-center gap-4 rounded-lg border border-border bg-bg p-3">
			{/* Discord Channel */}
			<div className="flex items-center gap-2">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#5865F2]">
					<img
						src="https://cdn.brandfetch.io/discord.com/w/512/h/512/theme/light/symbol"
						alt="Discord"
						className="size-5 object-contain"
					/>
				</div>
				<div>
					<p className="font-medium text-fg text-sm">#{discordChannelName}</p>
					<p className="text-muted-fg text-xs">{discordServerName}</p>
				</div>
			</div>

			{/* Sync Direction */}
			<div className="flex shrink-0 items-center">
				<SyncDirectionSelect
					value={link.syncDirection as SyncDirection}
					onChange={handleDirectionChange}
					isDisabled={isUpdatingDirection}
				/>
			</div>

			{/* Hazel Channel */}
			<div className="flex items-center gap-2">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary">
					<IconHashtag className="size-4 text-muted-fg" />
				</div>
				<p className="font-medium text-fg text-sm">#{hazelChannelName}</p>
			</div>

			{/* Spacer */}
			<div className="flex-1" />

			{/* Actions */}
			<div className="flex shrink-0 items-center gap-2">
				<Switch
					isSelected={link.isEnabled}
					isDisabled={isToggling}
					onChange={handleToggleEnabled}
					aria-label={link.isEnabled ? "Disable mapping" : "Enable mapping"}
				/>

				<Menu>
					<Button intent="plain" size="sq-sm" className="text-muted-fg">
						<IconDotsVertical className="size-4" />
					</Button>
					<MenuContent placement="bottom end">
						<MenuItem onAction={handleToggleEnabled} isDisabled={isToggling}>
							{link.isEnabled ? (
								<IconCirclePause className="size-4" />
							) : (
								<IconPlay className="size-4" />
							)}
							<MenuLabel>{link.isEnabled ? "Disable" : "Enable"}</MenuLabel>
						</MenuItem>
						<MenuSeparator />
						<MenuItem intent="danger" onAction={handleDelete} isDisabled={isDeleting}>
							<IconTrash className="size-4" />
							<MenuLabel>Delete</MenuLabel>
						</MenuItem>
					</MenuContent>
				</Menu>
			</div>
		</div>
	)
}
