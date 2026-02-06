import type { BotScope } from "@hazel/domain/rpc"
import type { IntegrationConnection } from "@hazel/domain/models"

type IntegrationProvider = IntegrationConnection.IntegrationProvider

/**
 * Scope definitions for bot permissions UI.
 * Shared between create and edit bot modals.
 */
export const BOT_SCOPES: Array<{ id: BotScope; label: string; shortLabel: string; description: string }> = [
	{
		id: "messages:read",
		label: "Read Messages",
		shortLabel: "Read",
		description: "Read messages in channels",
	},
	{
		id: "messages:write",
		label: "Send Messages",
		shortLabel: "Write",
		description: "Send and edit messages",
	},
	{
		id: "channels:read",
		label: "Read Channels",
		shortLabel: "Read",
		description: "View channel information",
	},
	{
		id: "channels:write",
		label: "Manage Channels",
		shortLabel: "Manage",
		description: "Create and modify channels",
	},
	{ id: "users:read", label: "Read Users", shortLabel: "Read", description: "View user profiles" },
	{ id: "reactions:write", label: "Add Reactions", shortLabel: "React", description: "React to messages" },
	{
		id: "commands:register",
		label: "Register Commands",
		shortLabel: "Commands",
		description: "Create slash commands",
	},
]

/**
 * Group scopes by resource type for cleaner display
 */
export function groupScopesByResource(scopes: readonly string[]): Record<string, string[]> {
	const groups: Record<string, string[]> = {}
	for (const scope of scopes) {
		const [resource, action] = scope.split(":")
		if (resource && action) {
			if (!groups[resource]) groups[resource] = []
			groups[resource].push(action)
		}
	}
	return groups
}

/**
 * Get a short display label for a scope
 */
export function getScopeDisplayLabel(scope: string): string {
	const [resource, action] = scope.split(":")
	if (!resource || !action) return scope

	// Capitalize first letter
	const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
	return `${capitalize(resource)} · ${capitalize(action)}`
}

/**
 * Get scope metadata by scope ID
 */
export function getScopeInfo(scopeId: string) {
	return BOT_SCOPES.find((s) => s.id === scopeId)
}

/**
 * Integration provider display info with Brandfetch CDN icons
 */
export const INTEGRATION_PROVIDERS: Record<IntegrationProvider, { label: string; domain: string }> = {
	linear: { label: "Linear", domain: "linear.app" },
	github: { label: "GitHub", domain: "github.com" },
	figma: { label: "Figma", domain: "figma.com" },
	notion: { label: "Notion", domain: "notion.so" },
	discord: { label: "Discord", domain: "discord.com" },
}

/**
 * Get Brandfetch CDN URL for integration icon
 */
export function getIntegrationIconUrl(
	provider: IntegrationProvider,
	size: number = 64,
	theme: "light" | "dark" = "dark",
): string {
	const { domain } = INTEGRATION_PROVIDERS[provider]
	return `https://cdn.brandfetch.io/${domain}/w/${size}/h/${size}/theme/${theme}/icon`
}
