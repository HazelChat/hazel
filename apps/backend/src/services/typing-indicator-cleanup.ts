import { Effect, Schedule } from "effect"
import { TypingIndicatorRepo } from "../repositories/typing-indicator-repo"

// Simple cleanup function that runs periodically
export const startTypingIndicatorCleanup = Effect.gen(function* () {
	const typingIndicatorRepo = yield* TypingIndicatorRepo

	const cleanupStaleIndicators = Effect.gen(function* () {
		const deleted = yield* typingIndicatorRepo.deleteStale(10000).pipe(
			Effect.catchTag("DatabaseError", (error) =>
				Effect.gen(function* () {
					yield* Effect.logError("Failed to cleanup stale typing indicators", error)
					return []
				}),
			),
		)

		if (deleted.length > 0) {
			yield* Effect.logDebug(`Cleaned up ${deleted.length} stale typing indicators`)
		}

		return deleted.length
	})

	yield* Effect.logDebug("Starting typing indicator cleanup job")

	// Run cleanup every 5 seconds
	yield* cleanupStaleIndicators.pipe(Effect.repeat(Schedule.fixed(5000)), Effect.fork)
})
