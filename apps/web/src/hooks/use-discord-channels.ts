import type { OrganizationId } from "@hazel/schema"

interface DiscordChannel {
	id: string
	name: string
	type: string
}

/**
 * Hook to fetch Discord channels for an organization.
 *
 * Currently returns hardcoded channels for testing.
 * TODO: Replace with actual Discord API call via backend once bot is set up.
 */
export function useDiscordChannels(_organizationId: OrganizationId): DiscordChannel[] {
	// Hardcoded Discord channels for testing
	// In the future, this will fetch from the backend which will query Discord's API
	return [
		{ id: "1234567890123456781", name: "general", type: "text" },
		{ id: "1234567890123456782", name: "announcements", type: "text" },
		{ id: "1234567890123456783", name: "support", type: "text" },
		{ id: "1234567890123456784", name: "random", type: "text" },
		{ id: "1234567890123456785", name: "dev-chat", type: "text" },
		{ id: "1234567890123456786", name: "feedback", type: "text" },
	]
}
