import type { UserId } from "@hazel/schema"
import { ChannelIcon } from "~/components/channel-icon"
import { Avatar } from "~/components/ui/avatar"
import { useSidebar } from "~/components/ui/sidebar"
import { useChannel } from "~/db/hooks"
import { useChat } from "~/hooks/use-chat"
import { useAuth } from "~/lib/auth"
import { IconMenu } from "../icons/icon-menu"
import { PinnedMessagesModal } from "./pinned-messages-modal"

interface OtherMemberAvatarProps {
	member: {
		userId: UserId
		user: {
			avatarUrl?: string | null
			firstName: string
			lastName: string
		}
	}
}

function OtherMemberAvatar({ member }: OtherMemberAvatarProps) {
	const initials = `${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`

	return (
		<Avatar
			size="sm"
			src={member.user.avatarUrl}
			initials={initials}
			alt={`${member.user.firstName} ${member.user.lastName}`}
		/>
	)
}

export function ChatHeader() {
	const { channelId } = useChat()
	const { user } = useAuth()
	const { channel } = useChannel(channelId)
	const { isMobile, setIsOpenOnMobile } = useSidebar()

	if (!channel) {
		return (
			<div className="flex h-14 flex-shrink-0 items-center border-border border-b px-4">
				{isMobile && (
					<button
						type="button"
						onClick={() => setIsOpenOnMobile(true)}
						className="mr-3 -ml-1 rounded-md p-1.5 text-muted-fg hover:bg-secondary hover:text-fg"
					>
						<IconMenu className="size-5" />
					</button>
				)}
				<div className="h-4 w-32 animate-pulse rounded bg-secondary" />
			</div>
		)
	}

	const isDirectMessage = channel.type === "direct" || channel.type === "single"
	const otherMembers = channel.members.filter((member) => member.userId !== user?.id)

	return (
		<div className="flex h-14 shrink-0 items-center justify-between border-border border-b bg-bg px-4">
			<div className="flex items-center gap-3">
				{isMobile && (
					<button
						type="button"
						onClick={() => setIsOpenOnMobile(true)}
						className="-ml-1 rounded-md p-1.5 text-muted-fg hover:bg-secondary hover:text-fg"
					>
						<IconMenu className="size-5" />
					</button>
				)}
				{isDirectMessage ? (
					<>
						{otherMembers && otherMembers.length > 0 && otherMembers[0] && (
							<OtherMemberAvatar member={otherMembers[0]} />
						)}
						<div>
							<h2 className="font-semibold text-fg text-sm">
								{otherMembers
									.slice(0, 3)
									?.map((member) => `${member.user.firstName} ${member.user.lastName}`)
									.join(", ") || "Direct Message"}{" "}
								{otherMembers.length > 3 && (
									<span className="font-normal text-muted-fg text-xs">
										{` +${otherMembers.length - 3} more`}
									</span>
								)}
							</h2>
						</div>
					</>
				) : (
					<>
						<ChannelIcon icon={channel.icon} className="size-5 text-muted-fg" />
						<div>
							<h2 className="font-semibold text-fg text-sm">{channel.name}</h2>
						</div>
					</>
				)}
			</div>

			<div className="flex items-center gap-2">
				<PinnedMessagesModal />
			</div>
		</div>
	)
}
