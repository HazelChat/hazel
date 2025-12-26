import type { NotificationId } from "@hazel/schema"
import { Link, useParams } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconMsgs from "~/components/icons/icon-msgs"
import { Avatar } from "~/components/ui/avatar"
import type { NotificationWithDetails } from "~/hooks/use-notifications"
import { cn } from "~/lib/utils"

interface NotificationItemProps {
	notification: NotificationWithDetails
	onMarkAsRead: (id: NotificationId) => void
}

/**
 * Get the display text for the notification context
 */
function getNotificationContext(notification: NotificationWithDetails): string {
	const { channel, notification: n } = notification

	if (n.resourceType === "message" && channel) {
		return `New message in #${channel.name}`
	}

	if (channel) {
		return `Activity in #${channel.name}`
	}

	return "New notification"
}

/**
 * Get the message preview text (truncated)
 */
function getMessagePreview(notification: NotificationWithDetails, maxLength = 80): string {
	const { message } = notification

	if (!message?.content) {
		return "View notification"
	}

	// Strip any markdown or special characters for preview
	const plainText = message.content.replace(/[*_`~#]/g, "").trim()

	if (plainText.length <= maxLength) {
		return plainText
	}

	return `${plainText.slice(0, maxLength)}...`
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
	const { orgSlug } = useParams({ strict: false })
	const { notification: n, author, channel } = notification
	const isUnread = n.readAt === null

	// Determine navigation target
	const channelId = n.targetedResourceId
	const hasValidTarget = channelId && n.targetedResourceType === "channel"

	const handleClick = () => {
		if (isUnread) {
			onMarkAsRead(n.id)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			handleClick()
		}
	}

	const content = (
		// biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
		<div
			className={cn(
				"group flex items-start gap-3 px-4 py-3 transition-colors",
				hasValidTarget && "cursor-pointer hover:bg-secondary/50",
				!hasValidTarget && isUnread && "cursor-pointer hover:bg-secondary/50",
				!hasValidTarget && !isUnread && "cursor-default",
			)}
			onClick={!hasValidTarget ? handleClick : undefined}
			onKeyDown={!hasValidTarget && isUnread ? handleKeyDown : undefined}
			role={!hasValidTarget && isUnread ? "button" : undefined}
			tabIndex={!hasValidTarget && isUnread ? 0 : undefined}
		>
			{/* Unread indicator */}
			<div className="flex h-10 w-2 shrink-0 items-center justify-center">
				{isUnread && <div className="size-2 rounded-full bg-primary" />}
			</div>

			{/* Avatar */}
			<div className="shrink-0">
				{author ? (
					<Avatar
						size="md"
						src={author.avatarUrl}
						alt={`${author.firstName} ${author.lastName}`}
						initials={`${author.firstName?.charAt(0) ?? ""}${author.lastName?.charAt(0) ?? ""}`}
					/>
				) : (
					<div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
						{channel?.type === "public" || channel?.type === "private" ? (
							<IconHashtag className="size-5 text-muted-fg" />
						) : (
							<IconMsgs className="size-5 text-muted-fg" />
						)}
					</div>
				)}
			</div>

			{/* Content */}
			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-2">
					<p className={cn("line-clamp-2 text-sm", isUnread ? "font-medium text-fg" : "text-fg")}>
						{getMessagePreview(notification)}
					</p>
					<span className="shrink-0 text-muted-fg text-xs">
						{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
					</span>
				</div>
				<p className="mt-0.5 text-muted-fg text-xs">{getNotificationContext(notification)}</p>
			</div>
		</div>
	)

	// Wrap in Link if we have a valid navigation target
	if (hasValidTarget && orgSlug) {
		return (
			<Link
				to="/$orgSlug/chat/$id"
				params={{ orgSlug: orgSlug as string, id: channelId as string }}
				onClick={handleClick}
				className="block"
			>
				{content}
			</Link>
		)
	}

	return content
}
