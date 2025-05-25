import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { NotFound } from "../errors"
import { ChannelId, Message, MessageCursorResult, MessageId } from "../schema/message"

export const MessageApiGroup = HttpApiGroup.make("message")
	.add(
		HttpApiEndpoint.post("createMessage")`/:channelId/messages`
			.setPayload(Message.jsonCreate)
			.setPath(
				Schema.Struct({
					channelId: ChannelId,
				}),
			)
			.addSuccess(
				Schema.Struct({
					success: Schema.Boolean,
					id: MessageId,
				}),
			),
	)
	.add(
		HttpApiEndpoint.put("updateMessage")`/:channelId/messages/:id`
			.setPath(Schema.Struct({ id: MessageId, channelId: ChannelId }))
			.setPayload(Message.jsonUpdate)
			.addSuccess(
				Schema.Struct({
					success: Schema.Boolean,
				}),
			),
	)
	.add(
		HttpApiEndpoint.del("deleteMessage")`/:channelId/messages/:id`
			.setPath(Schema.Struct({ id: MessageId, channelId: ChannelId }))
			.addSuccess(
				Schema.Struct({
					success: Schema.Boolean,
				}),
			),
	)
	.add(
		HttpApiEndpoint.get("getMessage")`/:channelId/messages/:id`
			.setPath(
				Schema.Struct({
					channelId: ChannelId,
					id: MessageId,
				}),
			)
			.addSuccess(Message.json)
			.addError(NotFound),
	)
	.add(
		HttpApiEndpoint.get("getMessages")`/:channelId/messages`
			.setPath(
				Schema.Struct({
					channelId: ChannelId,
				}),
			)
			.setUrlParams(
				Schema.Struct({
					cursor: Schema.optional(MessageId),
					limit: Schema.optional(
						Schema.NumberFromString.pipe(Schema.int(), Schema.positive(), Schema.lessThanOrEqualTo(100)),
					),
				}),
			)
			.addSuccess(MessageCursorResult),
	)
