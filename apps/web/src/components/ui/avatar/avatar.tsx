import type { FC, ReactNode } from "react"
import type { PresenceStatus } from "~/utils/status"
import { AvatarBadge } from "./avatar-badge"
import type { AvatarSize } from "./avatar-context"
import { AvatarFallback } from "./avatar-fallback"
import { AvatarImage } from "./avatar-image"
import { AvatarRoot } from "./avatar-root"
import { AvatarStatusIndicator } from "./avatar-status-indicator"
import { AvatarVerifiedBadge } from "./avatar-verified-badge"

export interface AvatarProps {
	size?: AvatarSize
	className?: string
	src?: string | null
	alt?: string
	seed?: string
	/**
	 * Display a contrast border around the avatar.
	 */
	contrastBorder?: boolean
	/**
	 * Display a badge (i.e. company logo).
	 */
	badge?: ReactNode
	/**
	 * Display a status indicator.
	 */
	status?: PresenceStatus
	/**
	 * Display a verified tick icon.
	 *
	 * @default false
	 */
	verified?: boolean

	/**
	 * The initials of the user to display if no image is available.
	 */
	initials?: string
	/**
	 * An icon to display if no image is available.
	 */
	placeholderIcon?: FC<{ className?: string }>
	/**
	 * A placeholder to display if no image is available.
	 */
	placeholder?: ReactNode

	/**
	 * Whether the avatar should show a focus ring when the parent group is in focus.
	 * For example, when the avatar is wrapped inside a link.
	 *
	 * @default false
	 */
	focusable?: boolean

	/**
	 * Whether the avatar should be square instead of circular.
	 *
	 * @default false
	 */
	isSquare?: boolean
}

/**
 * Avatar component with convenience props for common use cases.
 *
 * For more control, use the compound component API:
 * ```tsx
 * <Avatar.Root size="md">
 *   <Avatar.Image src={avatarUrl} alt="User name" />
 *   <Avatar.Fallback>JD</Avatar.Fallback>
 *   <Avatar.Badge>
 *     <Avatar.StatusIndicator status="online" />
 *   </Avatar.Badge>
 * </Avatar.Root>
 * ```
 */
export const Avatar = ({
	contrastBorder = false,
	size = "md",
	src,
	alt,
	seed,
	initials,
	placeholder,
	placeholderIcon,
	badge,
	status,
	verified,
	focusable = false,
	isSquare = true,
	className,
}: AvatarProps) => {
	return (
		<AvatarRoot
			size={size}
			isSquare={isSquare}
			contrastBorder={contrastBorder}
			focusable={focusable}
			className={className}
			src={src}
			seed={seed}
		>
			<AvatarImage src={src} alt={alt} />
			<AvatarFallback icon={placeholderIcon}>
				{seed ? placeholder : initials || placeholder}
			</AvatarFallback>
			{(status || verified || badge) && (
				<AvatarBadge>
					{status ? (
						<AvatarStatusIndicator status={status} />
					) : verified ? (
						<AvatarVerifiedBadge />
					) : (
						badge
					)}
				</AvatarBadge>
			)}
		</AvatarRoot>
	)
}

// Compound component exports
Avatar.Root = AvatarRoot
Avatar.Image = AvatarImage
Avatar.Fallback = AvatarFallback
Avatar.Badge = AvatarBadge
Avatar.StatusIndicator = AvatarStatusIndicator
Avatar.VerifiedBadge = AvatarVerifiedBadge
