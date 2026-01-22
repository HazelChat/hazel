import { cn } from "~/lib/utils"

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
