import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { TypingIndicator } from "@hazel/db/models"
import { TypingIndicatorId } from "@hazel/db/schema"
import { CurrentUser, InternalServerError, UnauthorizedError } from "@hazel/effect-lib"
import { Schema } from "effect"
import { TransactionId } from "../../../lib/schema"

export class TypingIndicatorResponse extends Schema.Class<TypingIndicatorResponse>("TypingIndicatorResponse")(
	{
		data: TypingIndicator.Model.json,
		transactionId: TransactionId,
	},
) {}

export class TypingIndicatorNotFoundError extends Schema.TaggedError<TypingIndicatorNotFoundError>(
	"TypingIndicatorNotFoundError",
)(
	"TypingIndicatorNotFoundError",
	{
		typingIndicatorId: Schema.UUID,
	},
	{
		status: 404,
		description: "The typing indicator was not found",
	},
) {}

// Payload for creating/upserting typing indicator
export class CreateTypingIndicatorPayload extends Schema.Class<CreateTypingIndicatorPayload>(
	"CreateTypingIndicatorPayload",
)({
	channelId: Schema.UUID.pipe(Schema.brand("@HazelChat/ChannelId")),
	memberId: Schema.UUID.pipe(Schema.brand("@HazelChat/ChannelMemberId")),
	lastTyped: Schema.optional(Schema.Number),
}) {}

export class TypingIndicatorGroup extends HttpApiGroup.make("typingIndicators")
	.add(
		HttpApiEndpoint.post("create")`/`
			.setPayload(CreateTypingIndicatorPayload)
			.addSuccess(TypingIndicatorResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Create/Upsert Typing Indicator",
					description: "Record that a user is typing in a channel (upserts if exists)",
					summary: "Start typing",
				}),
			),
	)
	.add(
		HttpApiEndpoint.patch("update")`/{id}`
			.setPayload(TypingIndicator.Model.json)
			.setPath(Schema.Struct({ id: TypingIndicatorId }))
			.addSuccess(TypingIndicatorResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.addError(TypingIndicatorNotFoundError)
			.annotateContext(
				OpenApi.annotations({
					title: "Update Typing Indicator",
					description: "Update the typing indicator timestamp",
					summary: "Update typing",
				}),
			),
	)
	.add(
		HttpApiEndpoint.del("delete")`/{id}`
			.setPath(Schema.Struct({ id: TypingIndicatorId }))
			.addSuccess(TypingIndicatorResponse)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.addError(TypingIndicatorNotFoundError)
			.annotateContext(
				OpenApi.annotations({
					title: "Delete Typing Indicator",
					description: "Remove typing indicator when user stops typing",
					summary: "Stop typing",
				}),
			),
	)
	.prefix("/typing-indicators")
	.middleware(CurrentUser.Authorization) {}
