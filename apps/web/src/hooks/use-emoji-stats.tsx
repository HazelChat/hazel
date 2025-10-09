import { useAtomValue } from "@effect-atom/atom-react"
import {
	type EmojiUsage,
	emojiUsageAtom,
	resetEmojiStats,
	topEmojisAtom,
	trackEmojiUsage,
} from "~/atoms/emoji-atoms"

/**
 * Hook for managing emoji statistics with Effect Atoms
 * All usage data is automatically persisted to localStorage
 */
export function useEmojiStats() {
	// Read atom values
	const topEmojis = useAtomValue(topEmojisAtom)
	const emojiUsage = useAtomValue(emojiUsageAtom) ?? ({} as EmojiUsage)

	return {
		topEmojis,
		trackEmojiUsage,
		resetStats: resetEmojiStats,
		emojiUsage,
	}
}
