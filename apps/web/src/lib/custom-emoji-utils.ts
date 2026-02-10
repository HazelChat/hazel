const CUSTOM_EMOJI_PREFIX = "custom:"

/** Check if an emoji string represents a custom emoji */
export function isCustomEmoji(emoji: string): boolean {
	return emoji.startsWith(CUSTOM_EMOJI_PREFIX)
}

/** Get the shortcode name from a custom emoji string (strips "custom:" prefix) */
export function getCustomEmojiName(emoji: string): string {
	return emoji.slice(CUSTOM_EMOJI_PREFIX.length)
}

/** Format a shortcode name as a custom emoji key (adds "custom:" prefix) */
export function formatCustomEmojiKey(name: string): string {
	return `${CUSTOM_EMOJI_PREFIX}${name}`
}
