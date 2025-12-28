import { Schema } from "effect"

/**
 * Live object types for streaming content attached to messages/channels
 */

// Type of live object
export const LiveObjectType = Schema.Literal("ai_streaming", "deployment", "integration")
export type LiveObjectType = typeof LiveObjectType.Type

// Status of live object
export const LiveObjectStatus = Schema.Literal("streaming", "complete", "error")
export type LiveObjectStatus = typeof LiveObjectStatus.Type

// Prompt message sent to AI actor
export class PromptMessage extends Schema.Class<PromptMessage>("PromptMessage")({
	id: Schema.String,
	content: Schema.String,
	timestamp: Schema.Number,
}) {}

// Response chunk from AI actor
export class ResponseChunk extends Schema.Class<ResponseChunk>("ResponseChunk")({
	type: Schema.Literal("chunk", "complete", "error"),
	promptId: Schema.String,
	content: Schema.optional(Schema.String),
	isComplete: Schema.Boolean,
	error: Schema.optional(Schema.String),
}) {}

// Configuration for creating a live object
export class LiveObjectConfig extends Schema.Class<LiveObjectConfig>("LiveObjectConfig")({
	messageId: Schema.String,
	channelId: Schema.String,
	type: LiveObjectType,
}) {}

// Stream subscription info for frontend
export class StreamSubscription extends Schema.Class<StreamSubscription>("StreamSubscription")({
	messageId: Schema.String,
	responseStreamUrl: Schema.String,
	promptStreamUrl: Schema.String,
}) {}
