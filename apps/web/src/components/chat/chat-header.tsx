import type { UserId } from "@hazel/schema"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { ChannelIcon } from "~/components/channel-icon"
import { IconChevronRight } from "~/components/icons/icon-chevron-right"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { useSidebar } from "~/components/ui/sidebar"
import { Tooltip, TooltipContent } from "~/components/ui/tooltip"
import { channelCollection } from "~/db/collections"
import { useChannelWithCurrentUser, useParentChannel } from "~/db/hooks"
import { useChannelMemberActions } from "~/hooks/use-channel-member-actions"
import { useChat } from "~/hooks/use-chat"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import IconEye from "../icons/icon-eye"
import { IconMenu } from "../icons/icon-menu"
import IconThread from "../icons/icon-thread"
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
	const { channel } = useChannelWithCurrentUser(channelId)
	const { isMobile, setIsOpenOnMobile } = useSidebar()
	const { slug } = useOrganization()

	const { handleToggleHidden } = useChannelMemberActions(channel?.currentUser, "conversation")

	// Fallback query for channel data when user is not a member
	const { data: channelFallback } = useLiveQuery(
		(q) =>
			q
				.from({ channel: channelCollection })
				.where(({ channel: c }) => eq(c.id, channelId))
				.findOne()
				.select(({ channel: c }) => ({ ...c })),
		[channelId],
	)

	// Determine if this is a thread and fetch parent channel data
	const isThread = channel?.type === "thread"
	const { parentChannel } = useParentChannel(isThread ? (channel.parentChannelId ?? null) : null)

	if (!channel) {
		return (
			<div className="flex h-14 shrink-0 items-center border-border border-b bg-bg px-4">
				{isMobile && (
					<button
						type="button"
						onClick={() => setIsOpenOnMobile(true)}
						className="mr-3 -ml-1 rounded-md p-1.5 text-muted-fg hover:bg-secondary hover:text-fg"
					>
						<IconMenu className="size-5" />
					</button>
				)}
				{channelFallback ? (
					<div className="flex items-center gap-3">
						<ChannelIcon icon={channelFallback.icon} className="size-5 text-muted-fg" />
						<h2 className="font-semibold text-fg text-sm">{channelFallback.name}</h2>
					</div>
				) : (
					<div className="h-4 w-32 animate-pulse rounded bg-secondary" />
				)}
			</div>
		)
	}

	const isDirectMessage = channel.type === "direct" || channel.type === "single"
	const otherMembers = (channel.members ?? []).filter((member) => member.userId !== user?.id)

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
				{isThread ? (
					<div className="flex items-center gap-2">
						{/* Parent channel link */}
						{parentChannel && channel.parentChannelId && (
							<Link
								to="/$orgSlug/chat/$id"
								params={{ orgSlug: slug, id: channel.parentChannelId }}
								className="flex items-center gap-1.5 text-muted-fg transition-colors hover:text-fg"
							>
								<ChannelIcon icon={parentChannel.icon} className="size-4" />
								<span className="text-sm">{parentChannel.name}</span>
							</Link>
						)}

						{/* Breadcrumb separator */}
						<IconChevronRight className="size-4 shrink-0 text-muted-fg" />

						{/* Thread indicator with name */}
						<div className="flex items-center gap-1.5">
							<IconThread className="size-4 shrink-0 text-muted-fg" />
							<h2 className="truncate font-semibold text-fg text-sm">{channel.name}</h2>
						</div>
					</div>
				) : isDirectMessage ? (
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
				{isDirectMessage && channel.currentUser?.isHidden && (
					<Tooltip delay={100} closeDelay={20}>
						<Button intent="plain" onPress={handleToggleHidden} aria-label="Unhide conversation">
							<IconEye />
						</Button>
						<TooltipContent>Unhide conversation</TooltipContent>
					</Tooltip>
				)}
				<PinnedMessagesModal />
			</div>
		</div>
	)
}
