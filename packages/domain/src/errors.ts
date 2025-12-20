import { HttpApiSchema } from "@effect/platform"
import { Effect, Predicate, Schema } from "effect"
import { MessageId } from "./ids"

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>("UnauthorizedError")(
	"UnauthorizedError",
	{
		message: Schema.String,
		detail: Schema.String,
	},
	HttpApiSchema.annotations({
		status: 401,
	}),
) {
	static is(u: unknown): u is UnauthorizedError {
		return Predicate.isTagged(u, "UnauthorizedError")
	}
}

export class InternalServerError extends Schema.TaggedError<InternalServerError>("InternalServerError")(
	"InternalServerError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
		cause: Schema.optional(Schema.Any),
	},
	HttpApiSchema.annotations({
		status: 500,
	}),
) {}

export class WorkflowInitializationError extends Schema.TaggedError<WorkflowInitializationError>(
	"WorkflowInitializationError",
)(
	"WorkflowInitializationError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Any),
	},
	HttpApiSchema.annotations({
		status: 500,
	}),
) {}

export class DmChannelAlreadyExistsError extends Schema.TaggedError<DmChannelAlreadyExistsError>(
	"DmChannelAlreadyExistsError",
)(
	"DmChannelAlreadyExistsError",
	{
		message: Schema.String,
		detail: Schema.optional(Schema.String),
	},
	HttpApiSchema.annotations({
		status: 409,
	}),
) {}

/**
 * Error thrown when a message is not found.
 * Used in update, delete, and thread creation operations.
 */
export class MessageNotFoundError extends Schema.TaggedError<MessageNotFoundError>("MessageNotFoundError")(
	"MessageNotFoundError",
	{
		messageId: MessageId,
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {}

export function withRemapDbErrors<R, E extends { _tag: string }, A>(
	entityType: string,
	action: "update" | "create" | "delete" | "select",
	entityId?: any | { value: any; key: string }[],
) {
	return (
		effect: Effect.Effect<R, E, A>,
	): Effect.Effect<R, Exclude<E, { _tag: "DatabaseError" | "ParseError" }> | InternalServerError, A> => {
		return effect.pipe(
			Effect.catchTags({
				DatabaseError: (err: any) =>
					Effect.fail(
						new InternalServerError({
							message: `Error ${action}ing ${entityType}`,
							detail: constructDetailMessage(
								"There was an error in parsing when",
								entityType,
								entityId,
							),
							cause: String(err),
						}),
					),
				ParseError: (err: any) =>
					Effect.fail(
						new InternalServerError({
							message: `Error ${action}ing ${entityType}`,
							detail: constructDetailMessage(
								"There was an error in parsing when",
								entityType,
								entityId,
							),
							cause: String(err),
						}),
					),
			}),
		)
	}
}

const constructDetailMessage = (
	title: string,
	entityType: string,
	entityId?: any | { value: any; key: string }[],
) => {
	if (entityId) {
		if (Array.isArray(entityId)) {
			return `${title} the ${entityType} with values ${entityId
				.map((value) => `${value.key}: ${value.value}`)
				.join(", ")}`
		}
		return `${title} the ${entityType} with id ${entityId}`
	}

	return `${title} the ${entityType}`
}
