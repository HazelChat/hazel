/**
 * Streaming module for real-time message updates and AI streaming
 *
 * @example Low-level streaming API
 * ```typescript
 * import { createStreamSession } from "@hazel/bot-sdk"
 *
 * const stream = yield* createStreamSession(channelId)
 * yield* stream.appendText("Hello ")
 * yield* stream.startThinking()
 * yield* stream.complete()
 * ```
 *
 * @example High-level AI streaming API
 * ```typescript
 * import { createAIStreamSession } from "@hazel/bot-sdk"
 *
 * const stream = yield* createAIStreamSession(channelId, { model: "claude-3.5-sonnet" })
 * yield* stream.processChunk({ type: "text", text: "Hello" })
 * yield* stream.complete()
 * ```
 */

// Types
export type {
	AIContentChunk,
	AIStreamOptions,
	AIStreamSession,
	CreateStreamOptions,
	StreamSession,
} from "./types.ts"

// Errors
export { StreamError } from "./errors.ts"

// Services
export { ActorsClient, type MessageActor } from "./actors-client.ts"

// Core functions
export { createAIStreamSession, createStreamSession } from "./streaming-service.ts"
