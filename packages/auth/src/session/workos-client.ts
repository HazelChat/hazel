import { SessionLoadError, WorkOSUserFetchError } from "@hazel/domain"
import type { Organization } from "@workos-inc/node"
import { OrganizationFetchError } from "../errors.ts"
import {
	type AuthenticateWithSessionCookieFailedResponse,
	type AuthenticateWithSessionCookieSuccessResponse,
	type RefreshSessionResponse,
	type User as WorkOSUser,
	WorkOS as WorkOSNodeAPI,
} from "@workos-inc/node"
import { Effect, Redacted } from "effect"
import { AuthConfig } from "../config.ts"

/**
 * Sealed session wrapper with proper typing.
 * The WorkOS SDK's CookieSession type doesn't export well, so we define our own interface.
 */
export interface SealedSession {
	/**
	 * Authenticate the session.
	 * Returns success with user data, or failure with reason.
	 */
	authenticate(): Promise<
		AuthenticateWithSessionCookieSuccessResponse | AuthenticateWithSessionCookieFailedResponse
	>

	/**
	 * Refresh the session.
	 * Returns new sealed session data if successful.
	 */
	refresh(): Promise<RefreshSessionResponse>

	/**
	 * Get the logout URL for the session.
	 */
	getLogoutUrl(options?: { returnTo?: string }): Promise<string>
}

/**
 * WorkOS client wrapper with Effect integration.
 * Provides type-safe access to WorkOS SDK operations.
 */
export class WorkOSClient extends Effect.Service<WorkOSClient>()("@hazel/auth/WorkOSClient", {
	accessors: true,
	dependencies: [AuthConfig.Default],
	effect: Effect.gen(function* () {
		const config = yield* AuthConfig
		const client = new WorkOSNodeAPI(config.workosApiKey, {
			clientId: config.workosClientId,
		})

		const loadSealedSession = (sessionCookie: string): Effect.Effect<SealedSession, SessionLoadError> =>
			Effect.gen(function* () {
				// loadSealedSession is synchronous in the WorkOS SDK - it just creates the session object
				// The actual async operations happen when calling authenticate() or refresh()
				let session: SealedSession
				try {
					session = client.userManagement.loadSealedSession({
						sessionData: sessionCookie,
						cookiePassword: Redacted.value(config.workosPasswordCookie),
					}) as SealedSession
				} catch (error) {
					yield* Effect.annotateCurrentSpan("session.loaded", false)
					yield* Effect.annotateCurrentSpan("error.type", "SessionLoadError")
					return yield* Effect.fail(
						new SessionLoadError({
							message: "Failed to load sealed session from WorkOS",
							detail: String(error),
						}),
					)
				}

				yield* Effect.annotateCurrentSpan("session.loaded", true)
				yield* Effect.logDebug("Loaded sealed session from WorkOS")
				return session
			}).pipe(Effect.withSpan("WorkOSClient.loadSealedSession"))

		const getUser = (userId: string): Effect.Effect<WorkOSUser, WorkOSUserFetchError> =>
			Effect.tryPromise({
				try: () => client.userManagement.getUser(userId),
				catch: (error) =>
					new WorkOSUserFetchError({
						message: "Failed to fetch user from WorkOS",
						detail: String(error),
					}),
			}).pipe(
				Effect.tap(() => Effect.annotateCurrentSpan("user.found", true)),
				Effect.tapError(() => Effect.annotateCurrentSpan("user.found", false)),
				Effect.withSpan("WorkOSClient.getUser", { attributes: { "user.id": userId } }),
			)

		const getOrganization = (orgId: string): Effect.Effect<Organization, OrganizationFetchError> =>
			Effect.tryPromise({
				try: () => client.organizations.getOrganization(orgId),
				catch: (error) =>
					new OrganizationFetchError({
						message: "Failed to fetch organization from WorkOS",
						detail: String(error),
					}),
			}).pipe(
				Effect.tap(() => Effect.annotateCurrentSpan("org.found", true)),
				Effect.tapError(() => Effect.annotateCurrentSpan("org.found", false)),
				Effect.withSpan("WorkOSClient.getOrganization", { attributes: { "org.id": orgId } }),
			)

		return {
			loadSealedSession,
			getUser,
			getOrganization,
			clientId: config.workosClientId,
		}
	}),
}) {}
