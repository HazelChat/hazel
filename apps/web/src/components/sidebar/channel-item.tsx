import { useAtomSet } from "@effect-atom/atom-react"
import type { Channel, ChannelMember } from "@hazel/db/schema"
import type { ChannelSectionId } from "@hazel/schema"
import { useNavigate } from "@tanstack/react-router"
import { useModal } from "~/atoms/modal-atoms"
import { ChannelIcon } from "~/components/channel-icon"
import IconDots from "~/components/icons/icon-dots"
import { IconFolderPlus } from "~/components/icons/icon-folder-plus"
import IconGear from "~/components/icons/icon-gear"
import IconLeave from "~/components/icons/icon-leave"
import { IconStar } from "~/components/icons/icon-star"
import IconTrash from "~/components/icons/icon-trash"
import IconVolume from "~/components/icons/icon-volume"
import IconVolumeMute from "~/components/icons/icon-volume-mute"
import { ThreadItem } from "~/components/sidebar/thread-item"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuSubMenu } from "~/components/ui/menu"
import { SidebarItem, SidebarLabel, SidebarLink, SidebarTreeItem } from "~/components/ui/sidebar"
import { moveChannelToSectionAction } from "~/db/actions"
import { useChannelMemberActions } from "~/hooks/use-channel-member-actions"
import { useOrganization } from "~/hooks/use-organization"
import { toastExit } from "~/lib/toast-exit"

interface ChannelItemProps {
	channel: Omit<Channel, "updatedAt"> & { updatedAt: Date | null }
	member: ChannelMember
	threads?: Array<{
		channel: Omit<Channel, "updatedAt"> & { updatedAt: Date | null }
		member: ChannelMember
	}>
	/** Available sections for "move to section" menu */
	sections?: Array<{ id: ChannelSectionId; name: string }>
}

export const CHANNEL_DRAG_TYPE = "application/x-hazel-channel"

export function ChannelItem({ channel, member, threads, sections = [] }: ChannelItemProps) {
	const deleteChannelModal = useModal("delete-channel")

	const { slug } = useOrganization()
	const navigate = useNavigate()

	const { handleToggleMute, handleToggleFavorite, handleLeave } = useChannelMemberActions(member, "channel")
	const moveChannelToSection = useAtomSet(moveChannelToSectionAction, {
		mode: "promiseExit",
	})

	const handleMoveToSection = async (sectionId: ChannelSectionId | null) => {
		// Don't do anything if already in the target section
		if (channel.sectionId === sectionId) return

		await toastExit(
			moveChannelToSection({
				channelId: channel.id,
				sectionId,
			}),
			{
				loading: "Moving channel...",
				success: sectionId ? "Channel moved to section" : "Channel moved to default",
				customErrors: {
					ChannelNotFoundError: () => ({
						title: "Channel not found",
						description: "This channel may have been deleted.",
						isRetryable: false,
					}),
					ChannelSectionNotFoundError: () => ({
						title: "Section not found",
						description: "This section may have been deleted.",
						isRetryable: false,
					}),
				},
			},
		)
	}

	const hasThreads = threads && threads.length > 0

	return (
		<>
			<SidebarTreeItem
				id={channel.id}
				textValue={channel.name}
				// hasChildItems={hasThreads}
				content={
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
									<IconStar
										className={
											member.isFavorite
												? "size-4 text-favorite"
												: "size-4 text-muted-fg"
										}
									/>
									<MenuLabel>{member.isFavorite ? "Unfavorite" : "Favorite"}</MenuLabel>
								</MenuItem>
								{sections.length > 0 && (
									<MenuSubMenu>
										<MenuItem>
											<IconFolderPlus className="size-4" />
											<MenuLabel>Move to section</MenuLabel>
										</MenuItem>
										<MenuContent>
											<MenuItem
												onAction={() => handleMoveToSection(null)}
												className={channel.sectionId === null ? "bg-accent" : ""}
											>
												<MenuLabel>Channels (Default)</MenuLabel>
											</MenuItem>
											{sections.map((section) => (
												<MenuItem
													key={section.id}
													onAction={() => handleMoveToSection(section.id)}
													className={
														channel.sectionId === section.id ? "bg-accent" : ""
													}
												>
													<MenuLabel>{section.name}</MenuLabel>
												</MenuItem>
											))}
										</MenuContent>
									</MenuSubMenu>
								)}
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
								<MenuItem
								intent="danger"
								onAction={() =>
									deleteChannelModal.open({
										channelId: channel.id,
										channelName: channel.name,
									})
								}>
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
				}
			>
				{/* Nested threads - passed as children, outside TreeItemContent */}
				{hasThreads &&
					threads.map((thread) => (
						<SidebarTreeItem
							key={thread.channel.id}
							id={thread.channel.id}
							textValue={thread.channel.name}
							content={<ThreadItem thread={thread.channel} member={thread.member} />}
						/>
					))}
			</SidebarTreeItem>

		</>
	)
}
