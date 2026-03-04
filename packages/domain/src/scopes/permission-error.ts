import { HttpApiSchema } from "@effect/platform"
import { Predicate, Schema } from "effect"
import type { ApiScope } from "./api-scope"

export class PermissionError extends Schema.TaggedError<PermissionError>("PermissionError")(
	"PermissionError",
	{
		message: Schema.String,
		requiredScope: Schema.optional(Schema.String),
	},
	HttpApiSchema.annotations({
		status: 403,
	}),
) {
	static is(u: unknown): u is PermissionError {
		return Predicate.isTagged(u, "PermissionError")
	}

	static insufficientScope(scope: ApiScope): PermissionError {
		return new PermissionError({
			message: `Insufficient permissions: requires ${scope}`,
			requiredScope: scope,
		})
	}
}
