import type { BotId, OrganizationId, UserId } from "@hazel/schema"

/**
 * Represents an authenticated user (via WorkOS JWT)
 */
export interface UserClient {
	readonly type: "user"
	readonly userId: UserId
	readonly organizationId: OrganizationId | null
	readonly role: "admin" | "member" | "owner"
}

/**
 * Represents an authenticated bot (via hzl_bot_xxxxx token)
 */
export interface BotClient {
	readonly type: "bot"
	readonly userId: UserId
	readonly botId: BotId
	readonly organizationId: OrganizationId | null
	readonly scopes: readonly string[] | null
}

/**
 * Authenticated client identity stored in connection state.
 * Returned by validateToken and accessible via c.conn.state in actor actions.
 */
export type AuthenticatedClient = UserClient | BotClient

/**
 * Connection params passed from clients when connecting to actors
 */
export interface ActorConnectParams {
	readonly token: string
}

/**
 * Response from the backend bot token validation endpoint
 */
export interface BotTokenValidationResponse {
	readonly userId: string
	readonly botId: string
	readonly organizationId: string | null
	readonly scopes: readonly string[] | null
}
