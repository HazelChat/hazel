import { BackendAuth } from "@hazel/auth/backend"
import {
	CurrentUser,
	InvalidBearerTokenError,
	InvalidJwtPayloadError,
	SessionAuthenticationError,
	SessionExpiredError,
	SessionLoadError,
	SessionNotProvidedError,
	SessionRefreshError,
	WorkOSUserFetchError,
} from "@hazel/domain"
import { UserRepo } from "@hazel/backend-core"
import { Effect } from "effect"

/**
 * Session management service that handles authentication via WorkOS.
 * Supports both cookie-based (sealed session) and bearer token (JWT) authentication.
 *
 * This service delegates to @hazel/auth/backend for the actual authentication logic,
 * which provides Redis caching and proper WorkOS SDK types.
 */
export class SessionManager extends Effect.Service<SessionManager>()("SessionManager", {
	accessors: true,
	dependencies: [BackendAuth.Default, UserRepo.Default],
	effect: Effect.gen(function* () {
		const auth = yield* BackendAuth
		const userRepo = yield* UserRepo

		/**
		 * Authenticate with a WorkOS sealed session cookie.
		 * Returns the current user and optionally a new session cookie if refreshed.
		 *
		 * @param sessionCookie - The sealed session cookie from the request
		 * @param _workOsCookiePassword - Deprecated: password is now read from WORKOS_COOKIE_PASSWORD env var
		 */
		const authenticateWithCookie = (sessionCookie: string, _workOsCookiePassword?: string) =>
			auth.authenticateWithCookie(sessionCookie, userRepo)

		/**
		 * Authenticate with a WorkOS bearer token (JWT).
		 * Verifies the JWT signature and syncs the user to the database.
		 */
		const authenticateWithBearer = (bearerToken: string) =>
			auth.authenticateWithBearer(bearerToken, userRepo)

		return {
			authenticateWithCookie: authenticateWithCookie as (
				sessionCookie: string,
				workOsCookiePassword?: string,
			) => Effect.Effect<
				{ currentUser: CurrentUser.Schema; refreshedSession: string | undefined },
				| SessionLoadError
				| SessionAuthenticationError
				| InvalidJwtPayloadError
				| SessionNotProvidedError
				| SessionRefreshError
				| SessionExpiredError,
				never
			>,
			authenticateWithBearer: authenticateWithBearer as (
				bearerToken: string,
			) => Effect.Effect<
				CurrentUser.Schema,
				InvalidBearerTokenError | InvalidJwtPayloadError | WorkOSUserFetchError,
				never
			>,
			// Keep old method name for backward compatibility
			authenticateAndGetUser: authenticateWithCookie as (
				sessionCookie: string,
				workOsCookiePassword?: string,
			) => Effect.Effect<
				{ currentUser: CurrentUser.Schema; refreshedSession: string | undefined },
				| SessionLoadError
				| SessionAuthenticationError
				| InvalidJwtPayloadError
				| SessionNotProvidedError
				| SessionRefreshError
				| SessionExpiredError,
				never
			>,
		} as const
	}),
}) {}
