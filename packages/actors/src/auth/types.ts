import { BotId, OrganizationId, UserId } from "@hazel/schema"
import { Schema } from "effect"

/**
 * Represents an authenticated user (via Clerk JWT).
 */
export interface UserClient {
	readonly type: "user"
	/** Clerk user ID (`user_…`), carried through as an opaque string. */
	readonly externalId: string
	/** Clerk organization ID (`org_…`), or null when no active organization. */
	readonly externalOrganizationId: string | null
	readonly role: "admin" | "member"
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
	readonly userId: Schema.Schema.Type<typeof UserId>
	readonly botId: Schema.Schema.Type<typeof BotId>
	readonly organizationId: Schema.Schema.Type<typeof OrganizationId> | null
	readonly scopes: readonly string[] | null
}

export const BotTokenValidationResponseSchema = Schema.Struct({
	userId: UserId,
	botId: BotId,
	organizationId: Schema.NullOr(OrganizationId),
	scopes: Schema.NullOr(Schema.Array(Schema.String)),
})
