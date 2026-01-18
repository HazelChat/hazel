import { useCallback, useEffect, useMemo, useState } from "react"
import type {
	CollectionStatus,
	CollectionSyncEffectError,
	EffectCollection,
} from "../../../../libs/effect-electric-db-collection/src"
import { isPermanentError, isRecoverableError } from "../../../../libs/effect-electric-db-collection/src"

/**
 * Result of the useCollectionError hook
 */
export interface UseCollectionErrorResult {
	/**
	 * Whether the collection is currently in an error state
	 */
	isError: boolean

	/**
	 * The total count of errors that have occurred since the collection started
	 */
	errorCount: number

	/**
	 * The last error that occurred, if any
	 */
	lastError: Error | null

	/**
	 * The current collection status
	 */
	status: CollectionStatus

	/**
	 * Clears the error state and attempts to recover the collection
	 */
	clearError: () => void

	/**
	 * Whether the collection needs recovery (error count > 0 and in error state)
	 */
	needsRecovery: boolean

	/**
	 * Whether the last error is a permanent (non-retryable) error
	 */
	isPermanent: boolean

	/**
	 * Whether the last error is recoverable (retryable)
	 */
	isRecoverable: boolean
}

/**
 * Hook for monitoring and managing collection error states.
 *
 * This hook provides reactive access to the collection's error state,
 * including the ability to clear errors and recover the collection.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isError, lastError, clearError, needsRecovery, isPermanent } =
 *     useCollectionError(myCollection)
 *
 *   if (isError) {
 *     return (
 *       <div>
 *         <p>Error: {lastError?.message}</p>
 *         {!isPermanent && (
 *           <button onClick={clearError}>Retry</button>
 *         )}
 *       </div>
 *     )
 *   }
 *
 *   return <div>Collection is healthy</div>
 * }
 * ```
 */
export function useCollectionError(
	collection: EffectCollection<any, any> | null | undefined,
): UseCollectionErrorResult {
	// Local state for tracking collection error state
	const [isError, setIsError] = useState(false)
	const [errorCount, setErrorCount] = useState(0)
	const [lastError, setLastError] = useState<Error | null>(null)
	const [status, setStatus] = useState<CollectionStatus>("idle")

	// Sync state from collection utilities
	useEffect(() => {
		if (!collection) {
			setIsError(false)
			setErrorCount(0)
			setLastError(null)
			setStatus("idle")
			return
		}

		// Initial state sync
		const syncState = () => {
			setIsError(collection.utils.isError)
			setErrorCount(collection.utils.errorCount)
			setLastError(collection.utils.lastError || null)
			setStatus(collection.utils.status)
		}

		syncState()

		// Poll for changes since TanStack DB doesn't expose subscription API for these values
		const interval = setInterval(syncState, 1000)

		return () => clearInterval(interval)
	}, [collection])

	// Clear error callback
	const clearError = useCallback(() => {
		if (!collection) return

		try {
			collection.utils.clearError()
			// Sync state after clearing
			setIsError(collection.utils.isError)
			setErrorCount(collection.utils.errorCount)
			setLastError(collection.utils.lastError || null)
			setStatus(collection.utils.status)
		} catch (error) {
			console.error("Failed to clear collection error:", error)
		}
	}, [collection])

	// Derived state
	const needsRecovery = isError && errorCount > 0
	const isPermanent = lastError ? isPermanentError(lastError) : false
	const isRecoverable_ = lastError ? isRecoverableError(lastError) : false

	return useMemo(
		() => ({
			isError,
			errorCount,
			lastError,
			status,
			clearError,
			needsRecovery,
			isPermanent,
			isRecoverable: isRecoverable_,
		}),
		[isError, errorCount, lastError, status, clearError, needsRecovery, isPermanent, isRecoverable_],
	)
}

/**
 * Type guard to check if an error is a CollectionSyncEffectError
 */
export function isCollectionSyncError(error: unknown): error is CollectionSyncEffectError {
	return (
		typeof error === "object" &&
		error !== null &&
		"_tag" in error &&
		(error as { _tag: string })._tag === "CollectionSyncEffectError"
	)
}
