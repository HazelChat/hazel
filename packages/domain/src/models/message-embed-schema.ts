import { Schema } from "effect"

// Embed author section
export const MessageEmbedAuthor = Schema.Struct({
	name: Schema.String.pipe(Schema.maxLength(256)),
	url: Schema.optional(Schema.String.pipe(Schema.maxLength(2048))),
	iconUrl: Schema.optional(Schema.String.pipe(Schema.maxLength(2048))),
})
export type MessageEmbedAuthor = Schema.Schema.Type<typeof MessageEmbedAuthor>

// Embed footer section
export const MessageEmbedFooter = Schema.Struct({
	text: Schema.String.pipe(Schema.maxLength(2048)),
	iconUrl: Schema.optional(Schema.String.pipe(Schema.maxLength(2048))),
})
export type MessageEmbedFooter = Schema.Schema.Type<typeof MessageEmbedFooter>

// Badge intent for field styling
export const BadgeIntent = Schema.Literal(
	"primary",
	"secondary",
	"success",
	"info",
	"warning",
	"danger",
	"outline",
)
export type BadgeIntent = Schema.Schema.Type<typeof BadgeIntent>

// Field type for rendering mode
export const MessageEmbedFieldType = Schema.Literal("text", "badge")
export type MessageEmbedFieldType = Schema.Schema.Type<typeof MessageEmbedFieldType>

// Field options for type-specific settings
export const MessageEmbedFieldOptions = Schema.Struct({
	intent: Schema.optional(BadgeIntent),
})
export type MessageEmbedFieldOptions = Schema.Schema.Type<typeof MessageEmbedFieldOptions>

// Embed field (for key-value display)
export const MessageEmbedField = Schema.Struct({
	name: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(256)),
	value: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(1024)),
	inline: Schema.optional(Schema.Boolean),
	type: Schema.optional(MessageEmbedFieldType),
	options: Schema.optional(MessageEmbedFieldOptions),
})
export type MessageEmbedField = Schema.Schema.Type<typeof MessageEmbedField>

// Embed badge (for status indicators)
export const MessageEmbedBadge = Schema.Struct({
	text: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(64)),
	color: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.between(0, 16777215))), // 0x000000 to 0xFFFFFF
})
export type MessageEmbedBadge = Schema.Schema.Type<typeof MessageEmbedBadge>

// Agent step for cached state (matches actor's AgentStep)
export const CachedAgentStep = Schema.Struct({
	id: Schema.String,
	type: Schema.Literal("thinking", "tool_call", "tool_result", "text", "error"),
	status: Schema.Literal("pending", "active", "completed", "failed"),
	content: Schema.optional(Schema.String),
	toolName: Schema.optional(Schema.String),
	toolInput: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
	toolOutput: Schema.optional(Schema.Unknown),
	toolError: Schema.optional(Schema.String),
	startedAt: Schema.optional(Schema.Number),
	completedAt: Schema.optional(Schema.Number),
})
export type CachedAgentStep = Schema.Schema.Type<typeof CachedAgentStep>

// Live state cached snapshot for non-realtime clients
export const MessageEmbedLiveStateCached = Schema.Struct({
	status: Schema.Literal("idle", "active", "completed", "failed"),
	data: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
	text: Schema.optional(Schema.String),
	progress: Schema.optional(Schema.Number),
	error: Schema.optional(Schema.String),
	steps: Schema.optional(Schema.Array(CachedAgentStep)),
})
export type MessageEmbedLiveStateCached = Schema.Schema.Type<typeof MessageEmbedLiveStateCached>

// Live state configuration for real-time updates
export const MessageEmbedLiveState = Schema.Struct({
	enabled: Schema.Literal(true),
	cached: Schema.optional(MessageEmbedLiveStateCached),
})
export type MessageEmbedLiveState = Schema.Schema.Type<typeof MessageEmbedLiveState>

// Full embed schema (Discord-style)
export const MessageEmbed = Schema.Struct({
	title: Schema.optional(Schema.String.pipe(Schema.maxLength(256))),
	description: Schema.optional(Schema.String.pipe(Schema.maxLength(4096))),
	url: Schema.optional(Schema.String.pipe(Schema.maxLength(2048))),
	color: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.between(0, 16777215))), // 0x000000 to 0xFFFFFF
	author: Schema.optional(MessageEmbedAuthor),
	footer: Schema.optional(MessageEmbedFooter),
	image: Schema.optional(Schema.Struct({ url: Schema.String.pipe(Schema.maxLength(2048)) })),
	thumbnail: Schema.optional(Schema.Struct({ url: Schema.String.pipe(Schema.maxLength(2048)) })),
	fields: Schema.optional(Schema.Array(MessageEmbedField).pipe(Schema.maxItems(25))),
	timestamp: Schema.optional(Schema.String), // ISO 8601 timestamp
	badge: Schema.optional(MessageEmbedBadge), // Status badge (e.g., "Deployed", "Failed")
	liveState: Schema.optional(MessageEmbedLiveState), // Live state for real-time updates
})
export type MessageEmbed = Schema.Schema.Type<typeof MessageEmbed>

// Array of embeds for a message
export const MessageEmbeds = Schema.Array(MessageEmbed)
export type MessageEmbeds = Schema.Schema.Type<typeof MessageEmbeds>
