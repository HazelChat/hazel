/**
 * Resume State for Offset Persistence
 *
 * Abstractions for persisting stream offsets to enable resumption
 * after disconnection.
 */

import { Effect, Ref, HashMap, Context, Layer } from "effect"
import type { Offset } from "../offset.ts"

/**
 * Resume State interface for offset persistence.
 */
export interface ResumeState {
	/**
	 * Get the last saved offset for a stream.
	 *
	 * @param streamId - Stream identifier (URL or path)
	 * @returns The last saved offset, or undefined if none
	 */
	readonly getOffset: (streamId: string) => Effect.Effect<Offset | undefined>

	/**
	 * Save an offset for a stream.
	 *
	 * @param streamId - Stream identifier (URL or path)
	 * @param offset - Offset to save
	 */
	readonly setOffset: (streamId: string, offset: Offset) => Effect.Effect<void>

	/**
	 * Clear the saved offset for a stream.
	 *
	 * @param streamId - Stream identifier (URL or path)
	 */
	readonly clearOffset: (streamId: string) => Effect.Effect<void>
}

/**
 * Context tag for ResumeState service.
 */
export class ResumeStateTag extends Context.Tag("@DurableStreams/ResumeState")<ResumeStateTag, ResumeState>() {}

/**
 * Create an in-memory resume state implementation.
 *
 * State is lost when the process exits.
 * Suitable for testing and short-lived applications.
 */
export const makeInMemoryResumeState = Effect.gen(function* () {
	const offsets = yield* Ref.make(HashMap.empty<string, Offset>())

	const state: ResumeState = {
		getOffset: (streamId) =>
			Ref.get(offsets).pipe(
				Effect.map((map) => {
					const result = HashMap.get(map, streamId)
					return result._tag === "Some" ? result.value : undefined
				}),
			),

		setOffset: (streamId, offset) => Ref.update(offsets, HashMap.set(streamId, offset)),

		clearOffset: (streamId) => Ref.update(offsets, HashMap.remove(streamId)),
	}

	return state
})

/**
 * Layer providing in-memory resume state.
 */
export const InMemoryResumeStateLayer = Layer.effect(ResumeStateTag, makeInMemoryResumeState)

/**
 * Create a localStorage-based resume state implementation.
 *
 * Persists offsets to browser localStorage for cross-session resumption.
 * Only available in browser environments.
 *
 * @param prefix - Key prefix for localStorage entries (default: "@DurableStreams/offset/")
 */
export const makeLocalStorageResumeState = (prefix = "@DurableStreams/offset/"): ResumeState => {
	const state: ResumeState = {
		getOffset: (streamId) =>
			Effect.sync(() => {
				if (typeof localStorage === "undefined") {
					return undefined
				}
				const value = localStorage.getItem(`${prefix}${streamId}`)
				return (value as Offset | null) ?? undefined
			}),

		setOffset: (streamId, offset) =>
			Effect.sync(() => {
				if (typeof localStorage !== "undefined") {
					localStorage.setItem(`${prefix}${streamId}`, offset)
				}
			}),

		clearOffset: (streamId) =>
			Effect.sync(() => {
				if (typeof localStorage !== "undefined") {
					localStorage.removeItem(`${prefix}${streamId}`)
				}
			}),
	}

	return state
}

/**
 * Create a no-op resume state that doesn't persist anything.
 *
 * Useful when you don't need offset persistence.
 */
export const noOpResumeState: ResumeState = {
	getOffset: () => Effect.succeed(undefined),
	setOffset: () => Effect.void,
	clearOffset: () => Effect.void,
}
