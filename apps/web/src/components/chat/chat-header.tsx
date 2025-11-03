import type { UserId } from "@hazel/db/schema"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconPhone from "~/components/icons/icon-phone"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { useChannel } from "~/db/hooks"
import { useChat } from "~/hooks/use-chat"
import { useUserPresence } from "~/hooks/use-presence"
import { useAuth } from "~/lib/auth"

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
	const { isOnline } = useUserPresence(member.userId)

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

	if (!channel) {
		return (
			<div className="flex h-14 flex-shrink-0 items-center border-border border-b px-4">
				<div className="h-4 w-32 animate-pulse rounded bg-secondary" />
			</div>
		)
	}

	const isDirectMessage = channel.type === "direct" || channel.type === "single"
	const otherMembers = channel.members.filter((member) => member.userId !== user?.id)

	return (
		<div className="flex h-14 flex-shrink-0 items-center justify-between border-border border-b bg-bg px-4">
			<div className="flex items-center gap-3">
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
						<IconHashtag className="size-5 text-muted-fg" />
						<div>
							<h2 className="font-semibold text-fg text-sm">{channel.name}</h2>
						</div>
					</>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Button
					intent="plain"
					size="sq-sm"
					aria-label="Call"
					// TODO: Add navigation when route is available
					// onPress={() => navigate to call}
				>
					<IconPhone data-slot="icon" />
				</Button>

				{/* TODO: Add PinnedMessagesModal when available */}
			</div>
		</div>
	)
}
