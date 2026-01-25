import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

// Discord webhook response - just acknowledge receipt
export class DiscordWebhookResponse extends Schema.Class<DiscordWebhookResponse>("DiscordWebhookResponse")({
	type: Schema.Literal(1), // PONG response type for Discord verification
}) {}

// Discord interaction payload (simplified for webhook handling)
export const DiscordInteractionPayload = Schema.Struct({
	type: Schema.Number, // 1 = PING, other types for actual interactions
	application_id: Schema.optional(Schema.String),
	token: Schema.optional(Schema.String),
	// We'll handle the full payload in the handler
}).pipe(Schema.annotations({ identifier: "DiscordInteractionPayload" }))

// Discord webhook verification error
export class InvalidDiscordWebhookSignature extends Schema.TaggedError<InvalidDiscordWebhookSignature>()(
	"InvalidDiscordWebhookSignature",
	{
		message: Schema.String,
	},
) {}

// Discord webhook processing error
export class DiscordWebhookProcessingError extends Schema.TaggedError<DiscordWebhookProcessingError>()(
	"DiscordWebhookProcessingError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
	},
) {}

/**
 * Discord Webhooks API Group
 *
 * Handles incoming webhooks from Discord for bidirectional chat sync.
 * Discord sends events via Gateway or Interactions API - this handles both.
 */
export class DiscordWebhookGroup extends HttpApiGroup.make("discord-webhooks").add(
	HttpApiEndpoint.post("receiveInteraction")`/webhooks/discord`
		.addSuccess(DiscordWebhookResponse)
		.addError(InvalidDiscordWebhookSignature)
		.addError(DiscordWebhookProcessingError)
		.setPayload(DiscordInteractionPayload),
) {}
