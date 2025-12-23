import { ChannelId, MessageId, UserId } from "@hazel/schema"
import { Schema } from "effect"

// Message with author info for context
export const ThreadMessageContext = Schema.Struct({
	id: MessageId,
	content: Schema.String,
	authorId: UserId,
	authorName: Schema.String,
	createdAt: Schema.String,
})

export type ThreadMessageContext = typeof ThreadMessageContext.Type

// Result of gathering thread context
export const GetThreadContextResult = Schema.Struct({
	threadChannelId: ChannelId,
	currentName: Schema.String,
	originalMessage: ThreadMessageContext,
	threadMessages: Schema.Array(ThreadMessageContext),
})

export type GetThreadContextResult = typeof GetThreadContextResult.Type

// Result of generating thread name
export const GenerateThreadNameResult = Schema.Struct({
	threadName: Schema.String,
})

export type GenerateThreadNameResult = typeof GenerateThreadNameResult.Type

// Result of updating thread name
export const UpdateThreadNameResult = Schema.Struct({
	success: Schema.Boolean,
	previousName: Schema.String,
	newName: Schema.String,
})

export type UpdateThreadNameResult = typeof UpdateThreadNameResult.Type

// Error types
export class GetThreadContextError extends Schema.TaggedError<GetThreadContextError>()(
	"GetThreadContextError",
	{
		threadChannelId: ChannelId,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {}

export class GenerateThreadNameError extends Schema.TaggedError<GenerateThreadNameError>()(
	"GenerateThreadNameError",
	{
		threadChannelId: ChannelId,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {}

export class UpdateThreadNameError extends Schema.TaggedError<UpdateThreadNameError>()(
	"UpdateThreadNameError",
	{
		threadChannelId: ChannelId,
		message: Schema.String,
		cause: Schema.Unknown.pipe(Schema.optional),
	},
) {}
