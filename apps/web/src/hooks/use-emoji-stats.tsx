import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { useCallback } from "react"
import { type EmojiUsage, emojiUsageAtom, topEmojisAtom } from "~/atoms/emoji-atoms"

/**
 * Hook for managing emoji statistics with Effect Atoms
 * All usage data is automatically persisted to localStorage
 */
export function useEmojiStats() {
	const topEmojis = useAtomValue(topEmojisAtom)
	const emojiUsage = useAtomValue(emojiUsageAtom)
	const setEmojiUsage = useAtomSet(emojiUsageAtom)

	/**
	 * Track emoji usage - increments the count for the given emoji
	 */
	const trackEmojiUsage = useCallback(
		(emoji: string) => {
			setEmojiUsage((prev) => ({
				...prev,
				[emoji]: (prev[emoji] || 0) + 1,
			}))
		},
		[setEmojiUsage],
	)

	/**
	 * Reset all emoji statistics
	 */
	const resetStats = useCallback(() => {
		setEmojiUsage({} as EmojiUsage)
	}, [setEmojiUsage])

	return {
		topEmojis,
		trackEmojiUsage,
		resetStats,
		emojiUsage,
	}
}
