import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import { InternalServerError, MessageNotFoundError, UnauthorizedError } from "../../errors"
import { AttachmentId, ChannelId, MessageId } from "../../ids"
import { Message, MessageReaction } from "../../models"
import { MessageEmbeds } from "../../models/message-embed-schema"
import { RateLimitExceededError } from "../../rate-limit-errors"
import { TransactionId } from "../../transaction-id"

// ============ PAGINATION SCHEMAS (Stripe-style) ============

export class ListMessagesQuery extends Schema.Class<ListMessagesQuery>("ListMessagesQuery")({
	channel_id: ChannelId,
	/** Cursor for older messages (fetch messages created before this message) */
	starting_after: Schema.optional(MessageId),
	/** Cursor for newer messages (fetch messages created after this message) */
	ending_before: Schema.optional(MessageId),
	/** Maximum number of messages to return (1-100, default 25) */
	limit: Schema.optional(
		Schema.NumberFromString.pipe(
			Schema.int(),
			Schema.greaterThanOrEqualTo(1),
			Schema.lessThanOrEqualTo(100),
		),
	),
}) {}

export class ListMessagesResponse extends Schema.Class<ListMessagesResponse>("ListMessagesResponse")({
	data: Schema.Array(Message.Model.json),
	has_more: Schema.Boolean,
}) {}

// ============ REQUEST SCHEMAS ============

export class CreateMessageRequest extends Schema.Class<CreateMessageRequest>("CreateMessageRequest")({
	channelId: ChannelId,
	content: Schema.String,
	replyToMessageId: Schema.NullishOr(MessageId),
	threadChannelId: Schema.NullishOr(ChannelId),
	attachmentIds: Schema.optional(Schema.Array(AttachmentId)),
	embeds: Schema.NullishOr(MessageEmbeds),
}) {}

export class UpdateMessageRequest extends Schema.Class<UpdateMessageRequest>("UpdateMessageRequest")({
	content: Schema.optional(Schema.String),
	embeds: Schema.optional(Schema.NullOr(MessageEmbeds)),
}) {}

export class ToggleReactionRequest extends Schema.Class<ToggleReactionRequest>("ToggleReactionRequest")({
	emoji: Schema.String,
	channelId: ChannelId,
}) {}

// ============ RESPONSE SCHEMAS ============

export class MessageResponse extends Schema.Class<MessageResponse>("MessageResponse")({
	data: Message.Model.json,
	transactionId: TransactionId,
}) {}

export class DeleteMessageResponse extends Schema.Class<DeleteMessageResponse>("DeleteMessageResponse")({
	transactionId: TransactionId,
}) {}

export class ToggleReactionResponse extends Schema.Class<ToggleReactionResponse>("ToggleReactionResponse")({
	wasCreated: Schema.Boolean,
	data: Schema.optional(MessageReaction.Model.json),
	transactionId: TransactionId,
}) {}

// ============ ERROR TYPES ============

export class ChannelNotFoundError extends Schema.TaggedError<ChannelNotFoundError>()(
	"ChannelNotFoundError",
	{
		channelId: ChannelId,
	},
	HttpApiSchema.annotations({ status: 404 }),
) {}

export class InvalidPaginationError extends Schema.TaggedError<InvalidPaginationError>()(
	"InvalidPaginationError",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 400 }),
) {}

// ============ API GROUP ============

export class MessagesApiGroup extends HttpApiGroup.make("api-v1-messages")
	// List messages (with cursor-based pagination)
	.add(
		HttpApiEndpoint.get("listMessages", `/messages`)
			.setUrlParams(ListMessagesQuery)
			.addSuccess(ListMessagesResponse)
			.addError(ChannelNotFoundError)
			.addError(UnauthorizedError)
			.addError(InvalidPaginationError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "List Messages",
					description:
						"List messages in a channel with Stripe-style cursor-based pagination. Returns messages in reverse chronological order (newest first).",
					summary: "List messages",
				}),
			),
	)
	// Create message
	.add(
		HttpApiEndpoint.post("createMessage", `/messages`)
			.setPayload(CreateMessageRequest)
			.addSuccess(MessageResponse)
			.addError(ChannelNotFoundError)
			.addError(UnauthorizedError)
			.addError(RateLimitExceededError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Create Message",
					description: "Create a new message in a channel",
					summary: "Create message",
				}),
			),
	)
	// Update message
	.add(
		HttpApiEndpoint.patch("updateMessage", `/messages/:id`)
			.setPath(Schema.Struct({ id: MessageId }))
			.setPayload(UpdateMessageRequest)
			.addSuccess(MessageResponse)
			.addError(MessageNotFoundError)
			.addError(UnauthorizedError)
			.addError(RateLimitExceededError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Update Message",
					description: "Update an existing message",
					summary: "Update message",
				}),
			),
	)
	// Delete message
	.add(
		HttpApiEndpoint.del("deleteMessage", `/messages/:id`)
			.setPath(Schema.Struct({ id: MessageId }))
			.addSuccess(DeleteMessageResponse)
			.addError(MessageNotFoundError)
			.addError(UnauthorizedError)
			.addError(RateLimitExceededError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Delete Message",
					description: "Delete a message",
					summary: "Delete message",
				}),
			),
	)
	// Toggle reaction
	.add(
		HttpApiEndpoint.post("toggleReaction", `/messages/:id/reactions`)
			.setPath(Schema.Struct({ id: MessageId }))
			.setPayload(ToggleReactionRequest)
			.addSuccess(ToggleReactionResponse)
			.addError(MessageNotFoundError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Toggle Reaction",
					description: "Toggle a reaction on a message",
					summary: "Toggle reaction",
				}),
			),
	)
	.prefix("/api/v1") {}
