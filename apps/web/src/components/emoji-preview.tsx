interface EmojiPreviewProps {
	/** Unicode char for standard emojis */
	emoji?: string
	/** Image URL for custom emojis */
	customEmojiUrl?: string
	/** Shortcode name (without colons) */
	shortcode: string
	/** Display size */
	size?: "sm" | "md" | "lg"
}

const sizeClasses = {
	sm: { emoji: "text-2xl", img: "size-7" },
	md: { emoji: "text-4xl", img: "size-10" },
	lg: { emoji: "text-5xl", img: "size-12" },
} as const

export function EmojiPreview({ emoji, customEmojiUrl, shortcode, size = "md" }: EmojiPreviewProps) {
	const s = sizeClasses[size]

	return (
		<div className="flex flex-col items-center gap-1">
			{customEmojiUrl ? (
				<img src={customEmojiUrl} alt={`:${shortcode}:`} className={`${s.img} object-contain`} />
			) : (
				<span className={s.emoji}>{emoji}</span>
			)}
			<span className="text-muted-fg text-xs">:{shortcode}:</span>
		</div>
	)
}
