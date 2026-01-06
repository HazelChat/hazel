import { useAtomSet } from "@effect-atom/atom-react"
import type { Channel, ChannelMember } from "@hazel/db/schema"
import type { ChannelId } from "@hazel/schema"
import { Exit } from "effect"
import { useState } from "react"
import { toast } from "sonner"
import { generateThreadNameMutation } from "~/atoms/channel-atoms"
import IconBranch from "~/components/icons/icon-branch"
import IconDots from "~/components/icons/icon-dots"
import IconEdit from "~/components/icons/icon-edit"
import IconLeave from "~/components/icons/icon-leave"
import IconPenSparkle from "~/components/icons/icon-pen-sparkle"
import IconVolume from "~/components/icons/icon-volume"
import IconVolumeMute from "~/components/icons/icon-volume-mute"
import { RenameThreadModal } from "~/components/modals/rename-thread-modal"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel } from "~/components/ui/menu"
import { SidebarItem, SidebarLabel, SidebarLink } from "~/components/ui/sidebar"
import { useChannelMemberActions } from "~/hooks/use-channel-member-actions"
import { useOrganization } from "~/hooks/use-organization"

interface ThreadItemProps {
	thread: Omit<Channel, "updatedAt"> & { updatedAt: Date | null }
	member: ChannelMember
}

export function ThreadItem({ thread, member }: ThreadItemProps) {
	const { slug } = useOrganization()
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)

	const { handleToggleMute, handleLeave } = useChannelMemberActions(member, "thread")
	const generateName = useAtomSet(generateThreadNameMutation, {
		mode: "promiseExit",
	})

	const handleGenerateName = async () => {
		setIsGenerating(true)
		const exit = await generateName({
			payload: { channelId: thread.id as ChannelId },
		})
		setIsGenerating(false)

		if (Exit.isFailure(exit)) {
			toast.error("Failed to generate thread name")
		}
	}

	return (
		<>
			<SidebarItem tooltip={thread.name}>
				<SidebarLink
					to="/$orgSlug/chat/$id"
					params={{ orgSlug: slug, id: thread.id }}
					activeProps={{
						className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
					}}
				>
					<IconBranch className="size-4 text-muted-fg" />
					<SidebarLabel className="truncate">{thread.name}</SidebarLabel>
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
						<MenuItem onAction={handleGenerateName} isDisabled={isGenerating}>
							<IconPenSparkle className="size-4" />
							<MenuLabel>{isGenerating ? "Generating..." : "Generate name"}</MenuLabel>
						</MenuItem>
						<MenuItem onAction={() => setIsRenameModalOpen(true)}>
							<IconEdit className="size-4" />
							<MenuLabel>Rename thread</MenuLabel>
						</MenuItem>
						<MenuItem intent="danger" onAction={handleLeave}>
							<IconLeave />
							<MenuLabel className="text-destructive">Leave thread</MenuLabel>
						</MenuItem>
					</MenuContent>
				</Menu>
			</SidebarItem>
			<RenameThreadModal
				threadId={thread.id}
				isOpen={isRenameModalOpen}
				onOpenChange={setIsRenameModalOpen}
			/>
		</>
	)
}
