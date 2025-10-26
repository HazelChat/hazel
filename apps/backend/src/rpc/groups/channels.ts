import { Schema } from "effect"

/**
 * Error thrown when a channel is not found.
 * Re-exported from HttpApi collections for RPC use.
 *
 * TODO: This is a temporary placeholder. Will be replaced with full Channel RPC definitions
 * when we migrate the channels endpoints.
 */
export class ChannelNotFoundError extends Schema.TaggedError<ChannelNotFoundError>()("ChannelNotFoundError", {
	channelId: Schema.UUID,
}) {}
