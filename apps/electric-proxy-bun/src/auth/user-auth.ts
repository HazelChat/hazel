import { and, Database, eq, inArray, isNull, schema } from "@hazel/db"
import type { ChannelId, OrganizationId, OrganizationMemberId, UserId } from "@hazel/schema"
import { WorkOS } from "@workos-inc/node"
import { Effect, Option, Redacted, Schema } from "effect"
import { decodeJwt } from "jose"
import { ProxyConfigService } from "../config"

/**
 * JWT Payload schema from WorkOS
 */
const JwtPayload = Schema.Struct({
	sub: Schema.String,
	email: Schema.String,
	sid: Schema.String,
	org_id: Schema.optional(Schema.String),
	role: Schema.optional(Schema.String),
})

/**
 * Pre-queried access context for efficient WHERE clause generation
 */
export interface UserAccessContext {
	organizationIds: readonly OrganizationId[]
	channelIds: readonly ChannelId[]
	memberIds: readonly OrganizationMemberId[]
	coOrgUserIds: readonly UserId[]
}

/**
 * Authenticated user context extracted from session
 */
export interface AuthenticatedUser {
	userId: string // WorkOS external ID (e.g., user_01KAA...)
	internalUserId: UserId // Internal database UUID
	email: string
	organizationId?: string
	role?: string
}

/**
 * Authenticated user with pre-queried access context
 */
export interface AuthenticatedUserWithContext extends AuthenticatedUser {
	accessContext: UserAccessContext
}

/**
 * Authentication error
 */
export class AuthenticationError extends Schema.TaggedError<AuthenticationError>("AuthenticationError")(
	"AuthenticationError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
	},
) {}

/**
 * Parse cookie header and extract a specific cookie by name
 */
function parseCookie(cookieHeader: string, cookieName: string): string | null {
	const cookies = cookieHeader.split(";").map((c) => c.trim())
	for (const cookie of cookies) {
		const [name, ...valueParts] = cookie.split("=")
		if (name === cookieName) {
			return valueParts.join("=")
		}
	}
	return null
}

/**
 * Internal implementation to get user access context from database
 */
const getAccessContextImpl = (internalUserId: UserId) =>
	Effect.gen(function* () {
		const db = yield* Database.Database

		// Pre-query user's access context
		const orgMembers = yield* db
			.execute((client) =>
				client
					.select({
						organizationId: schema.organizationMembersTable.organizationId,
						id: schema.organizationMembersTable.id,
					})
					.from(schema.organizationMembersTable)
					.where(
						and(
							eq(schema.organizationMembersTable.userId, internalUserId),
							isNull(schema.organizationMembersTable.deletedAt),
						),
					),
			)
			.pipe(
				Effect.mapError(
					(error) =>
						new AuthenticationError({
							message: "Failed to query user's organizations",
							detail: String(error),
						}),
				),
			)

		const organizationIds = orgMembers.map((m) => m.organizationId)
		const memberIds = orgMembers.map((m) => m.id)

		const channelMembers = yield* db
			.execute((client) =>
				client
					.select({ channelId: schema.channelMembersTable.channelId })
					.from(schema.channelMembersTable)
					.where(
						and(
							eq(schema.channelMembersTable.userId, internalUserId),
							isNull(schema.channelMembersTable.deletedAt),
						),
					),
			)
			.pipe(
				Effect.mapError(
					(error) =>
						new AuthenticationError({
							message: "Failed to query user's channels",
							detail: String(error),
						}),
				),
			)

		const channelIds = channelMembers.map((m) => m.channelId)

		const coOrgUsers =
			organizationIds.length > 0
				? yield* db
						.execute((client) =>
							client
								.selectDistinct({ userId: schema.organizationMembersTable.userId })
								.from(schema.organizationMembersTable)
								.where(
									and(
										inArray(
											schema.organizationMembersTable.organizationId,
											organizationIds,
										),
										isNull(schema.organizationMembersTable.deletedAt),
									),
								),
						)
						.pipe(
							Effect.mapError(
								(error) =>
									new AuthenticationError({
										message: "Failed to query co-organization users",
										detail: String(error),
									}),
							),
						)
				: []

		const coOrgUserIds = coOrgUsers.map((u) => u.userId)

		return {
			organizationIds,
			channelIds,
			memberIds,
			coOrgUserIds,
		} satisfies UserAccessContext
	})

/**
 * Cached version of getAccessContext (TTL: 60 seconds)
 * This reduces database load for repeated requests from the same user
 */
const cachedAccessContextMap = new Map<string, { context: UserAccessContext; timestamp: number }>()
const CACHE_TTL_MS = 60 * 1000 // 60 seconds

const getCachedAccessContext = (internalUserId: UserId) =>
	Effect.gen(function* () {
		const now = Date.now()
		const cached = cachedAccessContextMap.get(internalUserId)

		if (cached && now - cached.timestamp < CACHE_TTL_MS) {
			yield* Effect.log("Using cached access context", { userId: internalUserId })
			return cached.context
		}

		const context = yield* getAccessContextImpl(internalUserId)
		cachedAccessContextMap.set(internalUserId, { context, timestamp: now })
		yield* Effect.log("Cached new access context", { userId: internalUserId })

		return context
	})

/**
 * Validate a WorkOS sealed session cookie and return authenticated user
 * Uses Effect Config to read environment variables
 */
export const validateSession = Effect.fn("ElectricProxy.validateSession")(function* (request: Request) {
	const config = yield* ProxyConfigService

	// Extract cookie from request
	const cookieHeader = request.headers.get("Cookie")
	if (!cookieHeader) {
		return yield* Effect.fail(
			new AuthenticationError({
				message: "No cookie header found",
				detail: "Authentication required",
			}),
		)
	}

	const sessionCookie = parseCookie(cookieHeader, "workos-session")
	if (!sessionCookie) {
		return yield* Effect.fail(
			new AuthenticationError({
				message: "No workos-session cookie found",
				detail: "Authentication required",
			}),
		)
	}

	// Initialize WorkOS client
	const workos = new WorkOS(config.workosApiKey, {
		clientId: config.workosClientId,
	})

	// Load sealed session
	const sealedSession = yield* Effect.tryPromise({
		try: async () =>
			workos.userManagement.loadSealedSession({
				sessionData: sessionCookie,
				cookiePassword: Redacted.value(config.workosPasswordCookie),
			}),
		catch: (error) =>
			new AuthenticationError({
				message: "Failed to load sealed session",
				detail: String(error),
			}),
	})

	// Authenticate the session
	const session: any = yield* Effect.tryPromise({
		try: async () => sealedSession.authenticate(),
		catch: (error) =>
			new AuthenticationError({
				message: "Failed to authenticate session",
				detail: String(error),
			}),
	})

	// Check if authenticated
	if (!session.authenticated || !session.accessToken) {
		return yield* Effect.fail(
			new AuthenticationError({
				message: "Session not authenticated",
				detail: "Please log in again",
			}),
		)
	}

	// Decode JWT payload
	const rawPayload = decodeJwt(session.accessToken)
	const jwtPayload = yield* Schema.decodeUnknown(JwtPayload)(rawPayload).pipe(
		Effect.mapError(
			(error) =>
				new AuthenticationError({
					message: "Invalid JWT payload",
					detail: String(error),
				}),
		),
	)

	// Lookup internal user ID from database
	const db = yield* Database.Database
	const userOption = yield* db
		.execute((client) =>
			client
				.select({ id: schema.usersTable.id })
				.from(schema.usersTable)
				.where(eq(schema.usersTable.externalId, jwtPayload.sub))
				.limit(1),
		)
		.pipe(
			Effect.map((results) => Option.fromNullable(results[0])),
			Effect.mapError(
				(error) =>
					new AuthenticationError({
						message: "Failed to lookup user in database",
						detail: String(error),
					}),
			),
		)

	if (Option.isNone(userOption)) {
		return yield* Effect.fail(
			new AuthenticationError({
				message: "User not found in database",
				detail: `No user found with externalId: ${jwtPayload.sub}`,
			}),
		)
	}

	const internalUserId = userOption.value.id

	// Get cached access context
	const accessContext = yield* getCachedAccessContext(internalUserId)

	return {
		userId: jwtPayload.sub,
		internalUserId,
		email: jwtPayload.email,
		organizationId: jwtPayload.org_id,
		role: jwtPayload.role,
		accessContext,
	} satisfies AuthenticatedUserWithContext
})
