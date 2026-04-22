// Core types
export { type AuthenticatedUserContext, ValidatedSession, type WorkOSUser } from "./types.ts"

// Errors
export { SessionCacheError } from "./errors.ts"
export {
	ClerkUserFetchError,
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
export { ClerkClient, decodeSessionJwt, getJwtExpiry, WorkOSClient } from "./session/index.ts"

// Consumers
export { BackendAuth, BackendAuthLive, type UserRepoLike } from "./consumers/backend-auth.ts"
export { ProxyAuth, ProxyAuthenticationError, ProxyAuthLive } from "./consumers/proxy-auth.ts"
