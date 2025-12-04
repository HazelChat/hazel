import { Schema } from "effect"

// Embed author section
export const MessageEmbedAuthor = Schema.Struct({
	name: Schema.String,
	url: Schema.optional(Schema.String),
	iconUrl: Schema.optional(Schema.String),
})
export type MessageEmbedAuthor = Schema.Schema.Type<typeof MessageEmbedAuthor>

// Embed footer section
export const MessageEmbedFooter = Schema.Struct({
	text: Schema.String,
	iconUrl: Schema.optional(Schema.String),
})
export type MessageEmbedFooter = Schema.Schema.Type<typeof MessageEmbedFooter>

// Embed field (for key-value display)
export const MessageEmbedField = Schema.Struct({
	name: Schema.String,
	value: Schema.String,
	inline: Schema.optional(Schema.Boolean),
})
export type MessageEmbedField = Schema.Schema.Type<typeof MessageEmbedField>

// Full embed schema (Discord-style)
export const MessageEmbed = Schema.Struct({
	title: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	url: Schema.optional(Schema.String),
	color: Schema.optional(Schema.Number), // Hex color as integer (e.g., 0x5865F2 = 5793522)
	author: Schema.optional(MessageEmbedAuthor),
	footer: Schema.optional(MessageEmbedFooter),
	image: Schema.optional(Schema.Struct({ url: Schema.String })),
	thumbnail: Schema.optional(Schema.Struct({ url: Schema.String })),
	fields: Schema.optional(Schema.Array(MessageEmbedField)),
	timestamp: Schema.optional(Schema.String), // ISO 8601 timestamp
})
export type MessageEmbed = Schema.Schema.Type<typeof MessageEmbed>

// Array of embeds for a message
export const MessageEmbeds = Schema.Array(MessageEmbed)
export type MessageEmbeds = Schema.Schema.Type<typeof MessageEmbeds>
