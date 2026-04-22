import { BackendAuth, type UserRepoLike } from "@hazel/auth/backend"
import {
	ClerkUserFetchError,
	CurrentUser,
	InvalidBearerTokenError,
	InvalidJwtPayloadError,
	WorkOSUserFetchError,
} from "@hazel/domain"
import { UserRepo } from "@hazel/backend-core"
import { ServiceMap, Effect, Layer } from "effect"

/**
 * Session management service that handles bearer-token authentication.
 *
 * During the WorkOS → Clerk migration this accepts tokens from either provider;
 * the issuer is sniffed from the JWT payload and routed accordingly. Post-cutover,
 * the WorkOS branch gets removed (Phase H).
 */
export class SessionManager extends ServiceMap.Service<SessionManager>()("SessionManager", {
	make: Effect.gen(function* () {
		const auth = yield* BackendAuth
		const userRepo = yield* UserRepo
		const userRepoLike: UserRepoLike = {
			findByWorkOSUserId: userRepo.findByWorkOSUserId,
			findByExternalId: userRepo.findByExternalId,
			upsertWorkOSUser: userRepo.upsertWorkOSUser,
			upsertClerkUser: userRepo.upsertClerkUser,
			setExternalIdById: userRepo.setExternalIdById,
			update: userRepo.update,
		}

		/**
		 * Unified bearer-token authenticator. Routes to Clerk or WorkOS based on JWT issuer.
		 */
		const authenticateWithBearer = (bearerToken: string) =>
			auth.authenticate(bearerToken, userRepoLike)

		return {
			authenticateWithBearer: authenticateWithBearer as (
				bearerToken: string,
			) => Effect.Effect<
				CurrentUser.Schema,
				| InvalidBearerTokenError
				| InvalidJwtPayloadError
				| WorkOSUserFetchError
				| ClerkUserFetchError,
				never
			>,
		} as const
	}),
}) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(BackendAuth.layer),
		Layer.provide(UserRepo.layer),
	)
}
