import { HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>("UnauthorizedError")(
	"MessageNotFoundError",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({
		status: 401,
	}),
) {}

export class InternalServerError extends Schema.TaggedError<InternalServerError>("InternalServerError")(
	"InternalServerError",
	{
		message: Schema.String,
		cause: Schema.Any,
	},
	HttpApiSchema.annotations({
		status: 500,
	}),
) {}
