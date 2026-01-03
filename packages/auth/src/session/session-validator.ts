import {
	InvalidJwtPayloadError,
	SessionAuthenticationError,
	SessionExpiredError,
	SessionLoadError,
	SessionNotProvidedError,
	SessionRefreshError,
} from "@hazel/domain"
import { AuthenticateWithSessionCookieFailureReason } from "@workos-inc/node"
import { Effect, Layer, Option } from "effect"
import { SessionCache } from "../cache/session-cache.ts"
import type { SessionCacheError } from "../errors.ts"
import { ValidatedSession } from "../types.ts"
import { getJwtExpiry } from "./jwt-decoder.ts"
import { type SealedSession, WorkOSClient } from "./workos-client.ts"

/**
 * Core session validation service.
 * Handles WorkOS sealed session authentication with Redis caching.
 */
export class SessionValidator extends Effect.Service<SessionValidator>()("@hazel/auth/SessionValidator", {
	accessors: true,
	dependencies: [WorkOSClient.Default, SessionCache.Default],
	effect: Effect.gen(function* () {
		const workos = yield* WorkOSClient
		const cache = yield* SessionCache

		/**
		 * Resolve the internal organization UUID from a WorkOS organization ID.
		 * WorkOS stores our internal UUID as the organization's externalId.
		 */
		const resolveInternalOrgId = (workosOrgId: string | null | undefined) =>
			Effect.gen(function* () {
				if (!workosOrgId) {
					return null
				}

				const org = yield* workos.getOrganization(workosOrgId).pipe(
					Effect.catchAll((error) => {
						// Log warning but don't fail - org lookup is best-effort
						return Effect.logWarning("Failed to resolve internal org ID", {
							workosOrgId,
							error: String(error),
						}).pipe(Effect.as(null))
					}),
				)

				if (!org) {
					return null
				}

				// externalId is our internal organization UUID
				return org.externalId ?? null
			})

		/**
		 * Build a ValidatedSession from a successful WorkOS authentication response.
		 * Note: internalOrganizationId is set to null here and resolved separately.
		 */
		const buildValidatedSession = (session: {
			user: {
				id: string
				email: string
				firstName?: string | null
				lastName?: string | null
				profilePictureUrl?: string | null
			}
			sessionId: string
			organizationId?: string
			role?: string
			accessToken: string
		}): ValidatedSession => {
			return new ValidatedSession({
				workosUserId: session.user.id,
				email: session.user.email,
				sessionId: session.sessionId,
				organizationId: session.organizationId ?? null,
				internalOrganizationId: null, // Resolved separately after building
				role: session.role ?? null,
				accessToken: session.accessToken,
				firstName: session.user.firstName ?? null,
				lastName: session.user.lastName ?? null,
				profilePictureUrl: session.user.profilePictureUrl ?? null,
				expiresAt: getJwtExpiry(session.accessToken),
			})
		}

		/**
		 * Enrich a ValidatedSession with the internal organization ID.
		 */
		const enrichWithInternalOrgId = (session: ValidatedSession) =>
			Effect.gen(function* () {
				const internalOrgId = yield* resolveInternalOrgId(session.organizationId)
				return new ValidatedSession({
					...session,
					internalOrganizationId: internalOrgId,
				})
			})

		/**
		 * Authenticate with WorkOS and build a ValidatedSession.
		 * Does NOT attempt refresh - use validateAndRefresh for that.
		 */
		const authenticateWithWorkOS = (sealedSession: SealedSession) =>
			Effect.gen(function* () {
				const result = yield* Effect.tryPromise({
					try: () => sealedSession.authenticate(),
					catch: (error) =>
						new SessionAuthenticationError({
							message: "Failed to authenticate sealed session",
							detail: String(error),
						}),
				})

				if (!result.authenticated) {
					// Map failure reasons to specific errors
					if (
						result.reason ===
						AuthenticateWithSessionCookieFailureReason.NO_SESSION_COOKIE_PROVIDED
					) {
						return yield* Effect.fail(
							new SessionNotProvidedError({
								message: "No session cookie provided",
								detail: "The session was not authenticated",
							}),
						)
					}

					if (result.reason === AuthenticateWithSessionCookieFailureReason.INVALID_JWT) {
						return yield* Effect.fail(
							new InvalidJwtPayloadError({
								message: "Invalid JWT in session cookie",
								detail: "The session JWT could not be verified",
							}),
						)
					}

					// Other failure - session likely expired
					return yield* Effect.fail(
						new SessionExpiredError({
							message: "Session expired or invalid",
							detail: `Reason: ${result.reason}`,
						}),
					)
				}

				// Build and return validated session
				return buildValidatedSession(result)
			})

		/**
		 * Validate a session cookie.
		 * Returns cached result if available, otherwise authenticates with WorkOS.
		 * Does NOT attempt refresh - will fail if session is expired.
		 */
		const validateSession = (sessionCookie: string) =>
			Effect.gen(function* () {
				// Try cache first
				const cached = yield* cache
					.get(sessionCookie)
					.pipe(Effect.catchAll(() => Effect.succeed(Option.none())))

				if (Option.isSome(cached)) {
					// Check if cached session is still valid (not expired)
					const now = Math.floor(Date.now() / 1000)
					if (cached.value.expiresAt > now) {
						yield* Effect.logDebug("Session cache hit")
						return cached.value
					}
					yield* Effect.logDebug("Cached session expired, re-validating")
				}

				// Cache miss or expired - validate with WorkOS
				yield* Effect.logDebug("Session cache miss, authenticating with WorkOS")

				const sealedSession = yield* workos.loadSealedSession(sessionCookie)
				const validated = yield* authenticateWithWorkOS(sealedSession)

				// Resolve internal organization ID
				const enriched = yield* enrichWithInternalOrgId(validated)

				// Cache the result
				yield* cache
					.set(sessionCookie, enriched)
					.pipe(Effect.catchAll((error) => Effect.logWarning("Failed to cache session", error)))

				return enriched
			})

		/**
		 * Validate and refresh a session if needed.
		 * First tries to authenticate, and if that fails with an expired session,
		 * attempts to refresh the session.
		 *
		 * Returns both the validated session and optionally a new sealed session cookie.
		 */
		const validateAndRefresh = (sessionCookie: string) =>
			Effect.gen(function* () {
				// Try cache first
				const cached = yield* cache
					.get(sessionCookie)
					.pipe(Effect.catchAll(() => Effect.succeed(Option.none())))

				if (Option.isSome(cached)) {
					const now = Math.floor(Date.now() / 1000)
					if (cached.value.expiresAt > now) {
						yield* Effect.logDebug("Session cache hit (with refresh check)")
						return { session: cached.value, newSealedSession: undefined as string | undefined }
					}
				}

				// Load sealed session from WorkOS
				const sealedSession = yield* workos.loadSealedSession(sessionCookie)

				// Try to authenticate
				const authResult = yield* Effect.tryPromise({
					try: () => sealedSession.authenticate(),
					catch: (error) =>
						new SessionAuthenticationError({
							message: "Failed to authenticate sealed session",
							detail: String(error),
						}),
				})

				// If authenticated successfully, cache and return
				if (authResult.authenticated) {
					const validated = buildValidatedSession(authResult)
					const enriched = yield* enrichWithInternalOrgId(validated)

					yield* cache
						.set(sessionCookie, enriched)
						.pipe(Effect.catchAll((error) => Effect.logWarning("Failed to cache session", error)))

					return { session: enriched, newSealedSession: undefined as string | undefined }
				}

				// Not authenticated - check if we should give up or try refresh
				if (
					authResult.reason ===
					AuthenticateWithSessionCookieFailureReason.NO_SESSION_COOKIE_PROVIDED
				) {
					return yield* Effect.fail(
						new SessionNotProvidedError({
							message: "No session cookie provided",
							detail: "The session was not authenticated",
						}),
					)
				}

				// Try to refresh the session
				yield* Effect.logDebug("Session authentication failed, attempting refresh")

				const refreshResult = yield* Effect.tryPromise({
					try: () => sealedSession.refresh(),
					catch: (error) =>
						new SessionRefreshError({
							message: "Failed to refresh sealed session",
							detail: String(error),
						}),
				})

				if (!refreshResult.authenticated || !refreshResult.sealedSession) {
					return yield* Effect.fail(
						new SessionExpiredError({
							message: "Failed to refresh session",
							detail: "The session could not be refreshed",
						}),
					)
				}

				// Build validated session from refresh result
				// RefreshSessionResponse has the same shape as AuthenticateWithSessionCookieSuccessResponse
				// plus sealedSession and session fields
				const validated = new ValidatedSession({
					workosUserId: refreshResult.user.id,
					email: refreshResult.user.email,
					sessionId: refreshResult.sessionId,
					organizationId: refreshResult.organizationId ?? null,
					internalOrganizationId: null, // Resolved below
					role: refreshResult.role ?? null,
					accessToken: refreshResult.session?.accessToken ?? "",
					firstName: refreshResult.user.firstName ?? null,
					lastName: refreshResult.user.lastName ?? null,
					profilePictureUrl: refreshResult.user.profilePictureUrl ?? null,
					expiresAt: refreshResult.session?.accessToken
						? getJwtExpiry(refreshResult.session.accessToken)
						: Math.floor(Date.now() / 1000) + 3600,
				})

				// Resolve internal organization ID
				const enriched = yield* enrichWithInternalOrgId(validated)

				// Cache the refreshed session with the NEW cookie
				yield* cache
					.set(refreshResult.sealedSession, enriched)
					.pipe(
						Effect.catchAll((error) =>
							Effect.logWarning("Failed to cache refreshed session", error),
						),
					)

				yield* Effect.logDebug("Session refreshed successfully")

				return {
					session: enriched,
					newSealedSession: refreshResult.sealedSession,
				}
			})

		/**
		 * Invalidate a cached session (e.g., on logout).
		 */
		const invalidate = (sessionCookie: string) =>
			cache
				.invalidate(sessionCookie)
				.pipe(
					Effect.catchAll((error) =>
						Effect.logWarning("Failed to invalidate cached session", error),
					),
				)

		return {
			validateSession,
			validateAndRefresh,
			invalidate,
		}
	}),
}) {}
