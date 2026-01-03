/**
 * Retry Strategies for Bot SDK
 *
 * Provides composable retry policies using Effect Schedule for handling
 * transient failures in external service communication.
 */

import { Duration, Effect, Schedule } from "effect"
import { isRetryable } from "./errors.ts"

/**
 * Pre-configured retry strategies for common bot SDK operations
 */
export const RetryStrategy = {
	/**
	 * Retry transient errors with exponential backoff
	 * - Base delay: 100ms
	 * - Max retries: 5
	 * - Jittered to prevent thundering herd
	 * - Only retries errors marked as retryable
	 */
	transientErrors: Schedule.exponential(Duration.millis(100), 2).pipe(
		Schedule.jittered,
		Schedule.whileInput(isRetryable),
		Schedule.intersect(Schedule.recurs(5)),
	),

	/**
	 * Retry connection errors with longer backoff
	 * - Base delay: 1 second
	 * - Max retries: 10
	 * - Jittered to prevent thundering herd
	 * - Suitable for Redis, Electric, or backend connection issues
	 */
	connectionErrors: Schedule.exponential(Duration.seconds(1), 2).pipe(
		Schedule.jittered,
		Schedule.intersect(Schedule.recurs(10)),
	),

	/**
	 * Fast retry for quick operations
	 * - Base delay: 50ms
	 * - Max retries: 3
	 * - Suitable for idempotent operations that should recover quickly
	 */
	quickRetry: Schedule.exponential(Duration.millis(50), 2).pipe(
		Schedule.jittered,
		Schedule.intersect(Schedule.recurs(3)),
	),

	/**
	 * Create a custom retry policy with circuit breaker pattern
	 * Stops retrying after threshold failures and resets after a period
	 */
	withCircuitBreaker: <A, E, R>(
		schedule: Schedule.Schedule<A, E, R>,
		options: {
			readonly threshold?: number
			readonly resetAfter?: Duration.DurationInput
		} = {},
	) => {
		const threshold = options.threshold ?? 5
		const resetAfter = options.resetAfter ?? Duration.seconds(30)

		return schedule.pipe(
			Schedule.resetAfter(resetAfter),
			Schedule.whileOutput((attempt) => (typeof attempt === "number" ? attempt < threshold : true)),
		)
	},

	/**
	 * Create a retry policy that logs each attempt
	 */
	withLogging: <A, E, R>(schedule: Schedule.Schedule<A, E, R>, operationName: string) =>
		schedule.pipe(
			Schedule.tapOutput((attempt) =>
				Effect.logWarning(`${operationName}: retry attempt`, {
					attempt,
					operation: operationName,
				}),
			),
		),
}

/**
 * Compose multiple retry strategies
 * The resulting schedule will use the intersection of both (stricter limits)
 */
export const composeRetryStrategies = <A1, E1, R1, A2, E2, R2>(
	first: Schedule.Schedule<A1, E1, R1>,
	second: Schedule.Schedule<A2, E2, R2>,
) => Schedule.intersect(first, second)
