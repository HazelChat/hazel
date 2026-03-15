import type { Response } from "effect/unstable/ai"
import { Effect, Stream } from "effect"

import { DegenerateOutputError } from "./errors.ts"

const WINDOW_SIZE = 200
const MIN_PATTERN_LEN = 2
const MAX_PATTERN_LEN = 10
const MIN_REPEATS = 8

/**
 * Detects degenerate repetitive output in a stream of LLM response parts.
 *
 * Maintains a sliding window of recent text-delta content and checks whether
 * any short substring (2-10 chars) repeats 8+ consecutive times at the tail.
 * If detected, the stream fails with a `DegenerateOutputError`.
 *
 * Non-text parts pass through unmodified.
 */
export const withDegenerationDetection = <E, R>(
	stream: Stream.Stream<Response.AnyPart, E, R>,
): Stream.Stream<Response.AnyPart, E | DegenerateOutputError, R> =>
	Stream.mapAccumEffect(stream, "", (window, part: Response.AnyPart) => {
		if (part.type !== "text-delta") {
			return Effect.succeed([window, part] as const)
		}

		const updated = (window + part.delta).slice(-WINDOW_SIZE)
		const detected = findRepetition(updated)

		if (detected) {
			return Effect.fail(
				new DegenerateOutputError({
					message: `Detected repeating pattern "${detected.pattern}" (${detected.repeats}x)`,
					pattern: detected.pattern,
					repeats: detected.repeats,
				}),
			)
		}

		return Effect.succeed([updated, part] as const)
	})

/**
 * Scans the tail of the window for any substring of length 2-10 that repeats
 * 8+ consecutive times. Returns the first match found, or null.
 */
function findRepetition(window: string): { pattern: string; repeats: number } | null {
	const len = window.length
	for (let patLen = MIN_PATTERN_LEN; patLen <= MAX_PATTERN_LEN; patLen++) {
		// Need at least MIN_REPEATS * patLen chars to detect
		if (len < patLen * MIN_REPEATS) continue

		const pattern = window.slice(len - patLen)
		let repeats = 1
		let pos = len - patLen * 2

		while (pos >= 0 && window.slice(pos, pos + patLen) === pattern) {
			repeats++
			pos -= patLen
		}

		if (repeats >= MIN_REPEATS) {
			return { pattern, repeats }
		}
	}
	return null
}
