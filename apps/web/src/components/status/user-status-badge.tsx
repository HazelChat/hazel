import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip"
import { cn } from "~/lib/utils"
import { formatStatusExpiration } from "~/utils/status"

interface UserStatusBadgeProps {
	emoji?: string | null
	message?: string | null
	variant?: "inline" | "full"
	className?: string
}

/**
 * Displays a user's custom status (emoji + optional message).
 *
 * @param variant - "inline" shows only emoji (for sidebar), "full" shows emoji + message (for popovers)
 */
export function UserStatusBadge({ emoji, message, variant = "inline", className }: UserStatusBadgeProps) {
	if (!emoji && !message) {
		return null
	}

	if (variant === "inline") {
		// Just show the emoji for compact displays like sidebar
		return emoji ? (
			<span
				className={cn("text-xs", className)}
				title={message ?? undefined}
				aria-label={message ? `Status: ${message}` : "Status"}
			>
				{emoji}
			</span>
		) : null
	}

	// Full variant - show emoji + message for popovers/detailed views
	return (
		<span
			className={cn("inline-flex items-center gap-1 text-sm text-muted-fg", className)}
			aria-label={`Status: ${[emoji, message].filter(Boolean).join(" ")}`}
		>
			{emoji && <span className="text-base">{emoji}</span>}
			{message && <span className="italic">"{message}"</span>}
		</span>
	)
}

interface QuietHoursInfo {
	isActive: boolean
	start?: string
	end?: string
}

interface StatusEmojiWithTooltipProps {
	emoji: string | null | undefined
	message?: string | null
	expiresAt?: Date | null
	className?: string
	quietHours?: QuietHoursInfo
}

const QUIET_HOURS_EMOJI = "😴"

/**
 * Displays a status emoji with an optional tooltip showing the message and expiration.
 * Also displays a moon indicator when the user is in quiet hours (if no custom emoji is set).
 * Unified component used across DM sidebar, message headers, and user menu.
 */
export function StatusEmojiWithTooltip({
	emoji,
	message,
	expiresAt,
	className,
	quietHours,
}: StatusEmojiWithTooltipProps) {
	// If user has a custom emoji, show that (takes precedence over quiet hours)
	if (emoji) {
		const expirationText = formatStatusExpiration(expiresAt)

		// Always show tooltip - if no message, just show the emoji
		return (
			<Tooltip delay={300}>
				<TooltipTrigger
					className={cn("cursor-default border-none bg-transparent p-0 text-sm", className)}
				>
					{emoji}
				</TooltipTrigger>
				<TooltipContent placement="top">
					{message || expirationText ? (
						<div className="flex flex-col gap-0.5">
							<div>
								<span className="text-base">{emoji}</span> {message}
							</div>
							{expirationText && (
								<div className="text-muted-fg text-xs">Until {expirationText}</div>
							)}
						</div>
					) : (
						<span className="text-base">{emoji}</span>
					)}
				</TooltipContent>
			</Tooltip>
		)
	}

	// If no custom emoji but user is in quiet hours, show moon indicator
	if (quietHours?.isActive) {
		const quietHoursText =
			quietHours.start && quietHours.end
				? `In quiet hours (${quietHours.start} - ${quietHours.end})`
				: "In quiet hours"

		return (
			<Tooltip delay={300}>
				<TooltipTrigger
					className={cn("cursor-default border-none bg-transparent p-0 text-sm", className)}
				>
					{QUIET_HOURS_EMOJI}
				</TooltipTrigger>
				<TooltipContent placement="top">{quietHoursText}</TooltipContent>
			</Tooltip>
		)
	}

	return null
}
