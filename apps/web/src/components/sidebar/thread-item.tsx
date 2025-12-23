import { useAtomSet } from "@effect-atom/atom-react"
import type { Channel, ChannelMember } from "@hazel/db/schema"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import IconBranch from "~/components/icons/icon-branch"
import IconDots from "~/components/icons/icon-dots"
import IconEdit from "~/components/icons/icon-edit"
import IconLeave from "~/components/icons/icon-leave"
import IconVolume from "~/components/icons/icon-volume"
import IconVolumeMute from "~/components/icons/icon-volume-mute"
import { RenameThreadModal } from "~/components/modals/rename-thread-modal"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel } from "~/components/ui/menu"
import { updateChannelMemberAction } from "~/db/actions"
import { useOrganization } from "~/hooks/use-organization"
import { matchExitWithToast } from "~/lib/toast-exit"
import { deleteChannelMemberMutation } from "~/atoms/channel-member-atoms"

interface ThreadItemProps {
	thread: Omit<Channel, "updatedAt"> & { updatedAt: Date | null }
	member: ChannelMember
}

export function ThreadItem({ thread, member }: ThreadItemProps) {
	const { slug } = useOrganization()
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)

	const updateMember = useAtomSet(updateChannelMemberAction, { mode: "promiseExit" })
	const deleteMember = useAtomSet(deleteChannelMemberMutation, { mode: "promiseExit" })

	const handleToggleMute = async () => {
		const exit = await updateMember({
			memberId: member.id,
			isMuted: !member.isMuted,
		})

		matchExitWithToast(exit, {
			onSuccess: () => {},
			successMessage: member.isMuted ? "Thread unmuted" : "Thread muted",
			customErrors: {
				ChannelMemberNotFoundError: () => ({
					title: "Membership not found",
					description: "You may no longer be a member of this thread.",
					isRetryable: false,
				}),
			},
		})
	}

	const handleLeaveThread = async () => {
		const exit = await deleteMember({
			payload: { id: member.id },
		})

		matchExitWithToast(exit, {
			onSuccess: () => {},
			successMessage: "Left thread",
			customErrors: {
				ChannelMemberNotFoundError: () => ({
					title: "Membership not found",
					description: "You may have already left this thread.",
					isRetryable: false,
				}),
			},
		})
	}

	return (
		<div className="group/thread-item relative col-span-full grid grid-cols-[auto_1fr] items-center gap-2 pl-2">
			<IconBranch className="size-4 text-muted-fg" />
			<Link
				to="/$orgSlug/chat/$id"
				params={{ orgSlug: slug, id: thread.id }}
				className="truncate rounded-md px-2 py-1.5 text-sm text-sidebar-fg hover:bg-sidebar-accent hover:text-sidebar-accent-fg"
				activeProps={{
					className: "bg-sidebar-accent font-medium text-sidebar-accent-fg",
				}}
			>
				{thread.name}
			</Link>
			<Menu>
				<Button
					intent="plain"
					className="absolute right-2 top-1/2 size-5 -translate-y-1/2 text-muted-fg opacity-0 group-hover/thread-item:opacity-100"
				>
					<IconDots className="size-5 sm:size-4" />
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
					<MenuItem onAction={() => setIsRenameModalOpen(true)}>
						<IconEdit className="size-4" />
						<MenuLabel>Rename thread</MenuLabel>
					</MenuItem>
					<MenuItem intent="danger" onAction={handleLeaveThread}>
						<IconLeave />
						<MenuLabel className="text-destructive">Leave thread</MenuLabel>
					</MenuItem>
				</MenuContent>
			</Menu>
			<RenameThreadModal
				threadId={thread.id}
				isOpen={isRenameModalOpen}
				onOpenChange={setIsRenameModalOpen}
			/>
		</div>
	)
}
