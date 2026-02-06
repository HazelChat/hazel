import type { IntegrationConnection } from "@hazel/domain/models"

type IntegrationProvider = IntegrationConnection.IntegrationProvider

/**
 * Integration provider to Brandfetch domain mapping
 */
const INTEGRATION_DOMAINS: Record<IntegrationProvider, string> = {
	linear: "linear.app",
	github: "github.com",
	figma: "figma.com",
	notion: "notion.so",
	discord: "discord.com",
}

/**
 * Integration provider to logo type mapping
 * Some brands use "icon" for better results
 */
const INTEGRATION_LOGO_TYPE: Partial<Record<IntegrationProvider, "symbol" | "icon">> = {
	figma: "icon",
	notion: "icon",
}

/**
 * Generates a Brandfetch CDN URL for an integration provider
 */
export const getBrandfetchIcon = (
	domain: string,
	options: { theme?: "light" | "dark"; size?: number; type?: "symbol" | "icon" } = {},
): string => {
	const { theme = "dark", size = 512, type = "symbol" } = options
	return `https://cdn.brandfetch.io/${domain}/w/${size}/h/${size}/theme/${theme}/${type}?token=1id0IQ-4i8Z46-n-DfQ`
}

/**
 * Bot data interface for avatar resolution
 */
export interface BotAvatarData {
	user?: { avatarUrl?: string | null } | null
	allowedIntegrations?: readonly IntegrationProvider[] | null
}

/**
 * Smart avatar resolution for bots.
 *
 * Resolution order:
 * 1. Machine user's avatarUrl if set
 * 2. null (component should show robot icon fallback)
 *
 * @param bot - Bot data with user (containing avatarUrl) and allowedIntegrations
 * @param theme - Theme for Brandfetch icons ("light" or "dark")
 * @returns Avatar URL or null
 */
export function resolveBotAvatarUrl(bot: BotAvatarData, _theme: "light" | "dark" = "dark"): string | null {
	// Use machine user's avatar if set, otherwise fallback to robot icon
	if (bot.user?.avatarUrl) {
		return bot.user.avatarUrl
	}

	return null
}
