// Core types
export {
	type AuthenticatedUserContext,
	type AuthenticateResult,
	type BackendAuthResult,
	ValidatedSession,
	type WorkOSUser,
} from "./types.ts"

// Errors
export { SessionCacheError } from "./errors.ts"
export {
	InvalidBearerTokenError,
	InvalidJwtPayloadError,
	SessionAuthenticationError,
	SessionExpiredError,
	SessionLoadError,
	SessionNotProvidedError,
	SessionRefreshError,
	WorkOSUserFetchError,
} from "./errors.ts"

// Configuration
export { AuthConfig, type AuthConfigShape } from "./config.ts"

// Session
export {
	decodeSessionJwt,
	getJwtExpiry,
	type SealedSession,
	SessionValidator,
	WorkOSClient,
} from "./session/index.ts"

// Cache
export {
	calculateCacheTtl,
	DEFAULT_CACHE_TTL,
	MIN_CACHE_TTL_SECONDS,
	SESSION_CACHE_PREFIX,
	sessionCacheKey,
	SessionCache,
} from "./cache/index.ts"

// Consumers
export { BackendAuth, BackendAuthLive, type UserRepoLike } from "./consumers/backend-auth.ts"
export { ProxyAuth, ProxyAuthenticationError, ProxyAuthLive } from "./consumers/proxy-auth.ts"
