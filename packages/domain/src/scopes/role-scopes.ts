import type { ApiScope } from "./api-scope"

const ALL_SCOPES: ReadonlySet<ApiScope> = new Set<ApiScope>([
	"organizations:read",
	"organizations:write",
	"channels:read",
	"channels:write",
	"messages:read",
	"messages:write",
	"channel-members:read",
	"channel-members:write",
	"organization-members:read",
	"organization-members:write",
	"invitations:read",
	"invitations:write",
	"bots:read",
	"bots:write",
	"attachments:read",
	"attachments:write",
	"channel-sections:read",
	"channel-sections:write",
	"channel-webhooks:read",
	"channel-webhooks:write",
	"custom-emojis:read",
	"custom-emojis:write",
	"github-subscriptions:read",
	"github-subscriptions:write",
	"integration-connections:read",
	"integration-connections:write",
	"message-reactions:read",
	"message-reactions:write",
	"notifications:read",
	"notifications:write",
	"pinned-messages:read",
	"pinned-messages:write",
	"rss-subscriptions:read",
	"rss-subscriptions:write",
	"typing-indicators:read",
	"typing-indicators:write",
	"user-presence-status:read",
	"user-presence-status:write",
	"users:read",
	"users:write",
])

/**
 * Maps an organization role to its granted API scopes.
 * Currently all roles get all scopes (matching existing behavior where all org members have full CRUD).
 * This can be refined later to add restricted roles.
 */
export const scopesForRole = (_role: "owner" | "admin" | "member"): ReadonlySet<ApiScope> => {
	return ALL_SCOPES
}
