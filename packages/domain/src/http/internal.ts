import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { MessageId } from "../ids"

/**
 * Internal API endpoints for service-to-service communication.
 * These endpoints are not exposed to the public API.
 */

const MessageCompletePayload = Schema.Struct({
	content: Schema.String,
	status: Schema.Literal("complete", "error"),
})

const MessageCompleteResponse = Schema.Struct({
	ok: Schema.Boolean,
})

export class InternalGroup extends HttpApiGroup.make("internal").add(
	HttpApiEndpoint.post("completeMessage", "/:messageId/complete")
		.addSuccess(MessageCompleteResponse)
		.setPayload(MessageCompletePayload)
		.setPath(
			Schema.Struct({
				messageId: MessageId,
			}),
		),
).prefix("/internal/messages") {}
