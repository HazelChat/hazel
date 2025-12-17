import { Result } from "@effect-atom/atom-react"
import type {
	InvalidBearerTokenError,
	InvalidJwtPayloadError,
	SessionAuthenticationError,
	SessionExpiredError,
	SessionLoadError,
	SessionNotProvidedError,
	SessionRefreshError,
	WorkOSUserFetchError,
} from "@hazel/domain"
import type * as CurrentUser from "@hazel/domain/current-user"
import type { InternalServerError, UnauthorizedError } from "@hazel/domain/errors"
import { Option } from "effect"
import { currentUserQueryAtom } from "./auth"
import { appRegistry } from "./registry"

export type AuthError =
	| UnauthorizedError
	| InternalServerError
	| SessionLoadError
	| SessionAuthenticationError
	| InvalidJwtPayloadError
	| SessionNotProvidedError
	| SessionRefreshError
	| SessionExpiredError
	| InvalidBearerTokenError
	| WorkOSUserFetchError

/**
 * Waits for auth atom to settle and returns the user.
 * For use in route loaders (outside React).
 */
export function waitForAuth(): Promise<{
	user: CurrentUser.Schema | null
	error: Option.Option<AuthError>
}> {
	return new Promise((resolve) => {
		const check = () => {
			const result = appRegistry.get(currentUserQueryAtom)
			// Check if result has settled (not Initial and not waiting)
			if (result._tag !== "Initial" && !result.waiting) {
				return {
					settled: true,
					user: Result.getOrElse(result, () => null),
					error: Result.error(result) as Option.Option<AuthError>,
				}
			}
			return { settled: false, user: null, error: Option.none<AuthError>() }
		}

		// Check immediately
		const immediate = check()
		if (immediate.settled) {
			resolve({ user: immediate.user, error: immediate.error })
			return
		}

		// Subscribe and wait for settlement
		const unsub = appRegistry.subscribe(currentUserQueryAtom, () => {
			const state = check()
			if (state.settled) {
				unsub()
				resolve({ user: state.user, error: state.error })
			}
		})
	})
}
