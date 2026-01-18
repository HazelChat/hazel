import { useAtomValue } from "@effect-atom/atom-react"
import type { IntegrationConnection } from "@hazel/domain/models"
import IconRobot from "~/components/icons/icon-robot"
import { Avatar, type AvatarProps } from "~/components/ui/avatar"
import { resolveBotAvatarUrl } from "~/lib/bot-avatar"
import { resolvedThemeAtom } from "~/components/theme-provider"

type IntegrationProvider = IntegrationConnection.IntegrationProvider

interface BotAvatarProps extends Omit<AvatarProps, "src" | "placeholderIcon"> {
	bot: {
		user?: { avatarUrl?: string | null } | null
		allowedIntegrations?: readonly IntegrationProvider[] | null
		name?: string
	}
}

/**
 * Avatar component for bots with smart avatar resolution.
 *
 * Resolution order:
 * 1. Custom avatarUrl if set
 * 2. Brandfetch icon if bot has exactly one allowedIntegration
 * 3. Robot icon fallback
 */
export function BotAvatar({ bot, className, ...props }: BotAvatarProps) {
	const theme = useAtomValue(resolvedThemeAtom)
	const avatarUrl = resolveBotAvatarUrl(bot, theme)

	return (
		<Avatar
			{...props}
			src={avatarUrl}
			alt={bot.name ? `${bot.name} avatar` : "Bot avatar"}
			placeholderIcon={IconRobot}
			className={className}
		/>
	)
}
