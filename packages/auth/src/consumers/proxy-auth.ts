import { Database, eq, schema } from "@hazel/db"
import { SessionAuthenticationError } from "@hazel/domain"
import type { OrganizationId, UserId } from "@hazel/schema"
import { Effect, Option } from "effect"
import type { AuthenticatedUserContext } from "../types.ts"
import { SessionValidator } from "../session/session-validator.ts"
import { WorkOSClient } from "../session/workos-client.ts"

/**
 * Authentication error for proxy auth.
 * Simpler error type than backend since we don't need HTTP status codes.
 */
export class ProxyAuthenticationError extends Error {
	readonly _tag = "ProxyAuthenticationError"
	constructor(
		message: string,
		readonly detail?: string,
	) {
		super(message)
		this.name = "ProxyAuthenticationError"
	}
}

/**
 * Electric-proxy authentication service.
 * Provides fast session validation without user sync.
 *
 * Key differences from BackendAuth:
 * - Does NOT upsert users to database (validates only)
 * - Does NOT handle session refresh (proxy can't set cookies)
 * - Rejects if user doesn't exist in database
 *
 * Note: Database.Database is intentionally NOT included in dependencies
 * as it's a global infrastructure layer provided at the application root.
 */
export class ProxyAuth extends Effect.Service<ProxyAuth>()("@hazel/auth/ProxyAuth", {
	accessors: true,
	dependencies: [SessionValidator.Default],
	effect: Effect.gen(function* () {
		const validator = yield* SessionValidator
		const db = yield* Database.Database

		/**
		 * Validate a session cookie and return user context.
		 * Uses cached session validation - does NOT attempt refresh.
		 * Rejects if user is not found in database.
		 */
		const validateSession = Effect.fn("ProxyAuth.validateSession")(function* (sessionCookie: string) {
				// Validate session (uses Redis cache)
				const session = yield* validator.validateSession(sessionCookie)

				// Lookup user in database - REJECT if not found
				const userOption = yield* db
					.execute((client) =>
						client
							.select({ id: schema.usersTable.id })
							.from(schema.usersTable)
							.where(eq(schema.usersTable.externalId, session.workosUserId))
							.limit(1),
					)
					.pipe(
						Effect.map((results) => Option.fromNullable(results[0])),
						Effect.mapError(
							(error) =>
								new ProxyAuthenticationError(
									"Failed to lookup user in database",
									String(error),
								),
						),
						Effect.withSpan("ProxyAuth.lookupUser", {
							attributes: { "workos.user_id": session.workosUserId },
						}),
					)

				if (Option.isNone(userOption)) {
					yield* Effect.annotateCurrentSpan("user.found", false)
					return yield* Effect.fail(
						new ProxyAuthenticationError(
							"User not found in database",
							`User must be created via backend first. WorkOS ID: ${session.workosUserId}`,
						),
					)
				}

				yield* Effect.annotateCurrentSpan("user.found", true)
				yield* Effect.annotateCurrentSpan("user.id", userOption.value.id)

				return {
					workosUserId: session.workosUserId,
					internalUserId: userOption.value.id as UserId,
					email: session.email,
					organizationId: session.internalOrganizationId as OrganizationId | undefined,
					role: session.role ?? undefined,
				} satisfies AuthenticatedUserContext
			})

		return {
			validateSession,
		}
	}),
}) {}

/**
 * Layer that provides ProxyAuth with all its dependencies via Effect.Service dependencies.
 *
 * ProxyAuth.Default automatically includes:
 * - SessionValidator.Default (which includes WorkOSClient.Default + SessionCache.Default)
 *
 * External dependencies that must be provided:
 * - Redis (for SessionCache)
 * - Database.Database (for user lookup)
 */
export const ProxyAuthLive = ProxyAuth.Default
