/**
 * Embed types for message embeds.
 * These types match the structure used in @hazel/db but are defined here
 * to avoid circular dependencies.
 */

export interface MessageEmbedAuthor {
	name: string
	url?: string
	iconUrl?: string
}

export interface MessageEmbedFooter {
	text: string
	iconUrl?: string
}

export interface MessageEmbedField {
	name: string
	value: string
	inline?: boolean
}

export interface MessageEmbedBadge {
	text: string
	color?: number // Hex color as integer
}

export interface MessageEmbed {
	title?: string
	description?: string
	url?: string
	color?: number // Hex color as integer
	author?: MessageEmbedAuthor
	footer?: MessageEmbedFooter
	image?: { url: string }
	thumbnail?: { url: string }
	fields?: MessageEmbedField[]
	timestamp?: string // ISO 8601 timestamp
	badge?: MessageEmbedBadge // Status badge (e.g., "Deployed", "Failed")
}
