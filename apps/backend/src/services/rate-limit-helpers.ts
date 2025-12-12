/**
 * Rate Limit Helpers
 *
 * Helper functions for applying rate limiting in handlers.
 * These are used instead of middleware because the middleware system
 * doesn't support depending on context from previous middlewares.
 */

import { RateLimitExceededError } from "@hazel/domain"
import { Effect } from "effect"
import { RateLimiter } from "./rate-limiter"

/**
 * Rate limit configuration for messages
 * 60 requests per minute per user
 */
export const MESSAGE_RATE_LIMIT = {
	limit: 120,
	windowMs: 60 * 1000,
}

/**
 * Rate limit configuration for avatar uploads
 * 5 requests per hour per user
 */
export const AVATAR_RATE_LIMIT = {
	limit: 5,
	windowMs: 60 * 60 * 1000,
}

/**
 * Check rate limit for message operations.
 * Call this at the start of message handlers.
 *
 * @param userId - The user ID to rate limit
 */
export const checkMessageRateLimit = (userId: string) =>
	Effect.gen(function* () {
		const rateLimiter = yield* RateLimiter

		const result = yield* rateLimiter
			.consume(`messages:${userId}`, MESSAGE_RATE_LIMIT.limit, MESSAGE_RATE_LIMIT.windowMs)
			.pipe(
				Effect.catchTag("RateLimiterError", (error) =>
					Effect.gen(function* () {
						// Log the error but allow the request through (fail open)
						yield* Effect.logWarning("Rate limiter unavailable, allowing request", error)
						return {
							allowed: true,
							remaining: MESSAGE_RATE_LIMIT.limit,
							resetAfterMs: MESSAGE_RATE_LIMIT.windowMs,
							limit: MESSAGE_RATE_LIMIT.limit,
						}
					}),
				),
			)

		if (!result.allowed) {
			return yield* Effect.fail(
				new RateLimitExceededError({
					message: "Message rate limit exceeded. Please wait before sending more messages.",
					retryAfterMs: result.resetAfterMs,
					limit: result.limit,
					remaining: result.remaining,
				}),
			)
		}

		yield* Effect.logDebug(
			`Rate limit check passed for user ${userId}: ${result.remaining}/${result.limit} remaining`,
		)
	})

/**
 * Check rate limit for avatar upload operations.
 * Call this at the start of avatar upload handlers.
 *
 * @param userId - The user ID to rate limit
 */
export const checkAvatarRateLimit = (userId: string) =>
	Effect.gen(function* () {
		const rateLimiter = yield* RateLimiter

		const result = yield* rateLimiter
			.consume(`avatars:${userId}`, AVATAR_RATE_LIMIT.limit, AVATAR_RATE_LIMIT.windowMs)
			.pipe(
				Effect.catchTag("RateLimiterError", (error) =>
					Effect.gen(function* () {
						// Log the error but allow the request through (fail open)
						yield* Effect.logWarning("Rate limiter unavailable, allowing request", error)
						return {
							allowed: true,
							remaining: AVATAR_RATE_LIMIT.limit,
							resetAfterMs: AVATAR_RATE_LIMIT.windowMs,
							limit: AVATAR_RATE_LIMIT.limit,
						}
					}),
				),
			)

		if (!result.allowed) {
			return yield* Effect.fail(
				new RateLimitExceededError({
					message: "Avatar upload rate limit exceeded. Please wait before uploading again.",
					retryAfterMs: result.resetAfterMs,
					limit: result.limit,
					remaining: result.remaining,
				}),
			)
		}

		yield* Effect.logDebug(
			`Avatar rate limit check passed for user ${userId}: ${result.remaining}/${result.limit} remaining`,
		)
	})
