import { UserId, WorkOSUserId } from "@hazel/schema"
import { Schema } from "effect"
import { Persistable } from "effect/unstable/persistence"
import { UserLookupCacheError } from "../errors.ts"

/**
 * Schema for cached user lookup result.
 * Maps workosUserId to internalUserId.
 */
export const UserLookupResult = Schema.Struct({
	internalUserId: UserId,
})

export type UserLookupResult = typeof UserLookupResult.Type

/**
 * Request type for user lookup cache operations.
 * Implements Persistable.Class for use with Persistence.
 */
export class UserLookupCacheRequest extends Persistable.Class<{
	payload: {
		/** WorkOS user ID (external ID) */
		workosUserId: typeof WorkOSUserId.Type
	}
}>()("UserLookupCacheRequest", {
	primaryKey: (payload) => payload.workosUserId,
	success: UserLookupResult,
	error: UserLookupCacheError,
}) {}
