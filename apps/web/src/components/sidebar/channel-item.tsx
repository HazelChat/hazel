import type { Channel, ChannelMember, OrganizationMember } from "@hazel/db/schema"
import type { ChannelId } from "@hazel/schema"
import { useState } from "react"
import { toast } from "sonner"
import IconDots from "~/components/icons/icon-dots"
import IconEdit from "~/components/icons/icon-edit"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconLeave from "~/components/icons/icon-leave"
import IconStar from "~/components/icons/icon-star"
import IconTrash from "~/components/icons/icon-trash"
import IconVolume from "~/components/icons/icon-volume"
import IconVolumeMute from "~/components/icons/icon-volume-mute"
import { DeleteChannelModal } from "~/components/modals/delete-channel-modal"
import { RenameChannelModal } from "~/components/modals/rename-channel-modal"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from "~/components/ui/menu"
import { SidebarItem, SidebarLabel, SidebarLink } from "~/components/ui/sidebar"
import { channelCollection, channelMemberCollection } from "~/db/collections"
import { useOrganization } from "~/hooks/use-organization"

interface ChannelItemProps {
	channel: Omit<Channel, "updatedAt"> & { updatedAt: Date | null }
	member: ChannelMember
}

export function ChannelItem({ channel, member }: ChannelItemProps) {
	const [renameModalOpen, setRenameModalOpen] = useState(false)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)

	const { slug } = useOrganization()

	const handleToggleMute = async () => {
		try {
			channelMemberCollection.update(member.id, (item) => {
				item.isMuted = !item.isMuted
			})
			toast.success(member.isMuted ? "Channel unmuted" : "Channel muted")
		} catch (error) {
			console.error("Failed to toggle mute:", error)
			toast.error("Failed to update channel")
		}
	}

	const handleToggleFavorite = async () => {
		try {
			channelMemberCollection.update(member.id, (item) => {
				item.isFavorite = !item.isFavorite
			})
			toast.success(member.isFavorite ? "Removed from favorites" : "Added to favorites")
		} catch (error) {
			console.error("Failed to toggle favorite:", error)
			toast.error("Failed to update channel")
		}
	}

	const handleDeleteChannel = async () => {
		try {
			channelCollection.delete(channel.id)
			toast.success("Channel deleted successfully")
		} catch (error) {
			console.error("Failed to delete channel:", error)
			toast.error("Failed to delete channel")
		}
	}

	const handleLeaveChannel = async () => {
		try {
			channelMemberCollection.delete(member.id)
			toast.success("Left channel successfully")
		} catch (error) {
			console.error("Failed to leave channel:", error)
			toast.error("Failed to leave channel")
		}
	}

	return (
		<>
			<SidebarItem tooltip={channel.name}>
				{({ isCollapsed, isFocused }) => (
					<>
						<SidebarLink
							to="/$orgSlug/chat/$id"
							params={{ orgSlug: slug, id: channel.id }}
							activeProps={{
								className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
							}}
						>
							<IconHashtag />
							<SidebarLabel>{channel.name}</SidebarLabel>
						</SidebarLink>
						{(!isCollapsed || isFocused) && (
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
										<IconStar
											className={
												member.isFavorite ? "size-4 text-yellow-500" : "size-4"
											}
										/>
										<MenuLabel>{member.isFavorite ? "Unfavorite" : "Favorite"}</MenuLabel>
									</MenuItem>
									<MenuSeparator />
									<MenuItem onAction={() => setRenameModalOpen(true)}>
										<IconEdit />
										<MenuLabel>Rename</MenuLabel>
									</MenuItem>
									<MenuItem intent="danger" onAction={() => setDeleteModalOpen(true)}>
										<IconTrash />
										<MenuLabel>Delete</MenuLabel>
									</MenuItem>
									<MenuSeparator />
									<MenuItem intent="danger" onAction={handleLeaveChannel}>
										<IconLeave />
										<MenuLabel className="text-destructive">Leave</MenuLabel>
									</MenuItem>
								</MenuContent>
							</Menu>
						)}
					</>
				)}
			</SidebarItem>

			{renameModalOpen && (
				<RenameChannelModal
					channelId={channel.id}
					isOpen={true}
					onOpenChange={(isOpen) => !isOpen && setRenameModalOpen(false)}
				/>
			)}

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
