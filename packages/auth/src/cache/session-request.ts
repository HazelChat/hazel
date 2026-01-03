import { PrimaryKey, Schema } from "effect"
import { SessionCacheError } from "../errors.ts"
import { ValidatedSession } from "../types.ts"

/**
 * Request type for session cache operations.
 * Implements TaggedRequest for use with @effect/experimental Persistence.
 */
export class SessionCacheRequest extends Schema.TaggedRequest<SessionCacheRequest>()("SessionCacheRequest", {
	failure: SessionCacheError,
	success: ValidatedSession,
	payload: {
		/** SHA-256 hash of the session cookie */
		sessionHash: Schema.String,
	},
}) {
	/**
	 * Primary key for cache storage.
	 * Used by ResultPersistence to generate the cache key.
	 */
	[PrimaryKey.symbol]() {
		return this.sessionHash
	}
}
