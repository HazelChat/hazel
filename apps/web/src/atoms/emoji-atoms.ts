import { BrowserKeyValueStore } from "@effect/platform-browser"
import { Atom } from "@effect-atom/atom-react"
import { Effect, Schema } from "effect"

/**
 * Default emojis to show when no usage data exists
 */
const DEFAULT_EMOJIS = ["👍", "❤️", "😂"] as const

/**
 * Schema for emoji usage data
 * Maps emoji string to usage count
 */
const EmojiUsageSchema = Schema.Record({
	key: Schema.String,
	value: Schema.Number,
})

export type EmojiUsage = typeof EmojiUsageSchema.Type

/**
 * localStorage runtime for emoji usage persistence
 */
const localStorageRuntime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage)

/**
 * Atom that stores emoji usage data in localStorage
 */
export const emojiUsageAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "hazel-emoji-usage",
	schema: Schema.NullOr(EmojiUsageSchema),
	defaultValue: () => ({}) as EmojiUsage,
})

/**
 * Derived atom that computes the top 3 most used emojis
 */
export const topEmojisAtom = Atom.make((get) => {
	const emojiUsage = get(emojiUsageAtom)

	if (!emojiUsage || Object.keys(emojiUsage).length === 0) {
		return DEFAULT_EMOJIS as unknown as string[]
	}

	const entries = Object.entries(emojiUsage)

	const sorted = entries.sort((a, b) => b[1] - a[1])

	const topEmojis = sorted.slice(0, 3).map(([emoji]) => emoji)

	if (topEmojis.length < 3) {
		const remainingDefaults = DEFAULT_EMOJIS.filter((emoji) => !topEmojis.includes(emoji))
		return [...topEmojis, ...remainingDefaults].slice(0, 3)
	}

	return topEmojis
}).pipe(Atom.keepAlive)

/**
 * Helper function to track emoji usage imperatively
 */
export const trackEmojiUsage = (emoji: string) => {
	Atom.batch(() => {
		Atom.update(emojiUsageAtom, (prev) => {
			const current = prev ?? {}
			return {
				...current,
				[emoji]: (current[emoji] || 0) + 1,
			}
		})
	})
}

/**
 * Helper function to reset emoji statistics imperatively
 */
export const resetEmojiStats = () => {
	Atom.batch(() => {
		Atom.set(emojiUsageAtom, {} as EmojiUsage)
	})
}
