import type { BaseRange } from "slate"
import { getEmojiShortcode } from "~/lib/emoji-shortcode-map"

export interface EmojiRange extends BaseRange {
	type: "emoji"
	emoji: string
	shortcode: string
}

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })

/**
 * Simple heuristic: a single grapheme cluster is an emoji if it contains
 * at least one codepoint in a known emoji range. This avoids false-positives
 * on normal letters/digits while catching ZWJ sequences, flags, skin tones, etc.
 */
function isEmojiGrapheme(grapheme: string): boolean {
	for (const cp of grapheme) {
		const code = cp.codePointAt(0)!
		if (
			(code >= 0x1f600 && code <= 0x1f64f) || // Emoticons
			(code >= 0x1f300 && code <= 0x1f5ff) || // Misc Symbols & Pictographs
			(code >= 0x1f680 && code <= 0x1f6ff) || // Transport & Map
			(code >= 0x1f700 && code <= 0x1f77f) || // Alchemical
			(code >= 0x1f780 && code <= 0x1f7ff) || // Geometric Shapes Extended
			(code >= 0x1f800 && code <= 0x1f8ff) || // Supplemental Arrows-C
			(code >= 0x1f900 && code <= 0x1f9ff) || // Supplemental Symbols
			(code >= 0x1fa00 && code <= 0x1fa6f) || // Chess Symbols
			(code >= 0x1fa70 && code <= 0x1faff) || // Symbols Extended-A
			(code >= 0x2600 && code <= 0x26ff) || // Misc symbols
			(code >= 0x2700 && code <= 0x27bf) || // Dingbats
			(code >= 0x231a && code <= 0x231b) || // Watch, Hourglass
			(code >= 0x23e9 && code <= 0x23f3) || // Media controls
			(code >= 0x23f8 && code <= 0x23fa) || // More media
			code === 0x200d || // ZWJ
			code === 0xfe0f || // Variation selector
			(code >= 0x2702 && code <= 0x27b0) || // Dingbats
			(code >= 0xfe00 && code <= 0xfe0f) || // Variation Selectors
			(code >= 0x2b05 && code <= 0x2b07) || // Arrows
			(code >= 0x2b1b && code <= 0x2b1c) || // Squares
			code === 0x2b50 || // Star
			code === 0x2b55 || // Circle
			(code >= 0x2934 && code <= 0x2935) || // Arrows
			code === 0x25aa ||
			code === 0x25ab || // Small squares
			code === 0x25b6 ||
			code === 0x25c0 || // Play buttons
			(code >= 0x25fb && code <= 0x25fe) || // Medium squares
			code === 0x2139 || // Information
			(code >= 0x2194 && code <= 0x2199) || // Arrows
			(code >= 0x21a9 && code <= 0x21aa) || // Arrows
			code === 0x00a9 ||
			code === 0x00ae || // ©®
			code === 0x2122 || // ™
			(code >= 0x2753 && code <= 0x2757) || // Question/exclamation
			(code >= 0x2763 && code <= 0x2764) || // Hearts
			(code >= 0x2795 && code <= 0x2797) || // Math
			code === 0x27a1 || // Arrow
			code === 0x27b0 ||
			code === 0x27bf || // Curly loop
			code === 0x2328 || // Keyboard
			code === 0x23cf || // Eject
			(code >= 0x23ed && code <= 0x23ef) || // Media controls
			code === 0x24c2 || // Circled M
			code === 0x274c ||
			code === 0x274e || // Cross marks
			(code >= 0x2733 && code <= 0x2734) || // Asterisks
			code === 0x2744 || // Snowflake
			code === 0x2747 || // Sparkle
			code === 0x303d || // Part alternation
			code === 0x3030 || // Wavy dash
			code === 0x3297 ||
			code === 0x3299 || // Japanese
			(code >= 0x1f1e6 && code <= 0x1f1ff) // Regional indicators (flags)
		) {
			return true
		}
	}
	return false
}

/**
 * Slate decorator: identifies standard Unicode emojis in text nodes
 * and returns decoration ranges with `{ type: "emoji", emoji, shortcode }`.
 *
 * Uses Intl.Segmenter for correct grapheme boundary detection (handles
 * ZWJ sequences, flags, skin tones, etc.).
 *
 * Only decorates emojis that have a known shortcode in our map.
 * Skips code blocks (caller should pass parentElement).
 */
export function decorateEmoji(entry: [node: any, path: number[]], parentElement?: any): EmojiRange[] {
	const [node, path] = entry
	const ranges: EmojiRange[] = []

	if (!node.text) return ranges

	// Skip emoji decoration in code blocks
	if (parentElement?.type === "code-block") return ranges

	const text: string = node.text
	const segments = segmenter.segment(text)

	for (const { segment, index } of segments) {
		if (!isEmojiGrapheme(segment)) continue

		const shortcode = getEmojiShortcode(segment)
		if (!shortcode) continue

		ranges.push({
			anchor: { path, offset: index },
			focus: { path, offset: index + segment.length },
			type: "emoji",
			emoji: segment,
			shortcode,
		})
	}

	return ranges
}
