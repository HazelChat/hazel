import { BackendAuth } from "@hazel/auth/backend"
import {
	CurrentUser,
	InvalidBearerTokenError,
	InvalidJwtPayloadError,
	WorkOSUserFetchError,
} from "@hazel/domain"
import { UserRepo } from "@hazel/backend-core"
import { ServiceMap, Effect } from "effect"

/**
 * Session management service that handles authentication via WorkOS.
 * Supports bearer token (JWT) authentication.
 *
 * This service delegates to @hazel/auth/backend for the actual authentication logic.
 */
export class SessionManager extends ServiceMap.Service<SessionManager>()("SessionManager", {
	dependencies: [BackendAuth.Default, UserRepo.Default],
	make: Effect.gen(function* () {
		const auth = yield* BackendAuth
		const userRepo = yield* UserRepo

		/**
		 * Authenticate with a WorkOS bearer token (JWT).
		 * Verifies the JWT signature and syncs the user to the database.
		 */
		const authenticateWithBearer = (bearerToken: string) =>
			auth.authenticateWithBearer(bearerToken, userRepo)

		return {
			authenticateWithBearer: authenticateWithBearer as (
				bearerToken: string,
			) => Effect.Effect<
				CurrentUser.Schema,
				InvalidBearerTokenError | InvalidJwtPayloadError | WorkOSUserFetchError,
				never
			>,
		} as const
	}),
}) {}
