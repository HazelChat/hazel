import { useAtomSet } from "@effect-atom/atom-react"
import type { Channel, ChannelMember } from "@hazel/db/schema"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { ChannelIcon } from "~/components/channel-icon"
import IconDots from "~/components/icons/icon-dots"
import IconGear from "~/components/icons/icon-gear"
import IconLeave from "~/components/icons/icon-leave"
import IconStar from "~/components/icons/icon-star"
import IconTrash from "~/components/icons/icon-trash"
import IconVolume from "~/components/icons/icon-volume"
import IconVolumeMute from "~/components/icons/icon-volume-mute"
import { DeleteChannelModal } from "~/components/modals/delete-channel-modal"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from "~/components/ui/menu"
import { SidebarItem, SidebarLabel, SidebarLink } from "~/components/ui/sidebar"
import { deleteChannelAction } from "~/db/actions"
import { useChannelMemberActions } from "~/hooks/use-channel-member-actions"
import { useOrganization } from "~/hooks/use-organization"
import { matchExitWithToast } from "~/lib/toast-exit"

interface ChannelItemProps {
	channel: Omit<Channel, "updatedAt"> & { updatedAt: Date | null }
	member: ChannelMember
}

export function ChannelItem({ channel, member }: ChannelItemProps) {
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)

	const { slug } = useOrganization()
	const navigate = useNavigate()

	const { handleToggleMute, handleToggleFavorite, handleLeave } = useChannelMemberActions(member, "channel")
	const deleteChannel = useAtomSet(deleteChannelAction, {
		mode: "promiseExit",
	})

	const handleDeleteChannel = async () => {
		const exit = await deleteChannel({ channelId: channel.id })

		matchExitWithToast(exit, {
			onSuccess: () => {},
			successMessage: "Channel deleted successfully",
			customErrors: {
				ChannelNotFoundError: () => ({
					title: "Channel not found",
					description: "This channel may have already been deleted.",
					isRetryable: false,
				}),
			},
		})
	}

	return (
		<>
			<SidebarItem
				tooltip={channel.name}
				badge={member.notificationCount > 0 ? member.notificationCount : undefined}
			>
				<SidebarLink
					to="/$orgSlug/chat/$id"
					params={{ orgSlug: slug, id: channel.id }}
					activeProps={{
						className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
					}}
				>
					<ChannelIcon icon={channel.icon} />
					<SidebarLabel>{channel.name}</SidebarLabel>
				</SidebarLink>
				<Menu>
					<Button
						intent="plain"
						size="sq-xs"
						data-slot="menu-trigger"
						className="size-5 text-muted-fg"
					>
						<IconDots className="size-4" />
					</Button>
					<MenuContent placement="right top" className="w-42">
						<MenuItem onAction={handleToggleMute}>
							{member.isMuted ? (
								<IconVolume className="size-4" />
							) : (
								<IconVolumeMute className="size-4" />
							)}
							<MenuLabel>{member.isMuted ? "Unmute" : "Mute"}</MenuLabel>
						</MenuItem>
						<MenuItem onAction={handleToggleFavorite}>
							<IconStar className={member.isFavorite ? "size-4 text-favorite" : "size-4"} />
							<MenuLabel>{member.isFavorite ? "Unfavorite" : "Favorite"}</MenuLabel>
						</MenuItem>
						<MenuSeparator />
						<MenuItem
							onAction={() =>
								navigate({
									to: "/$orgSlug/channels/$channelId/settings",
									params: { orgSlug: slug, channelId: channel.id },
								})
							}
						>
							<IconGear />
							<MenuLabel>Settings</MenuLabel>
						</MenuItem>
						<MenuItem intent="danger" onAction={() => setDeleteModalOpen(true)}>
							<IconTrash />
							<MenuLabel>Delete</MenuLabel>
						</MenuItem>
						<MenuSeparator />
						<MenuItem intent="danger" onAction={handleLeave}>
							<IconLeave />
							<MenuLabel className="text-destructive">Leave</MenuLabel>
						</MenuItem>
					</MenuContent>
				</Menu>
			</SidebarItem>

			{deleteModalOpen && (
				<DeleteChannelModal
					channelName={channel.name}
					isOpen={true}
					onOpenChange={(isOpen) => !isOpen && setDeleteModalOpen(false)}
					onConfirm={handleDeleteChannel}
				/>
			)}
		</>
	)
}
