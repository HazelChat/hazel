import { HttpApiSchema } from "@effect/platform"
import { Effect, Predicate, Schema } from "effect"
import { CurrentUser, UserId } from "./schema/user"

export const ErrorBaseSchema = Schema.Struct({
	title: Schema.String.pipe(Schema.maxLength(128)),
	detail: Schema.String.pipe(Schema.maxLength(255)),
})

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
	"hazel/Unauthorized",
	{
		actorId: UserId,
		entity: Schema.String,
		action: Schema.String,
	},
	HttpApiSchema.annotations({ status: 500 }),
) {
	override get message() {
		return `Actor (${this.actorId}) is not authorized to perform action "${this.action}" on entity "${this.entity}"`
	}

	static is(u: unknown): u is Unauthorized {
		return Predicate.isTagged(u, "hazel/Unauthorized")
	}

	static refail(entity: string, action: string) {
		return <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, Unauthorized, CurrentUser | R> =>
			Effect.catchIf(
				effect,
				(e) => !Unauthorized.is(e),
				() =>
					Effect.flatMap(
						CurrentUser,
						(actor) =>
							new Unauthorized({
								actorId: actor.userId,
								entity,
								action,
							}),
					),
			) as any
	}
}
export class NotFound extends Schema.TaggedError<NotFound>()(
	"@hazel/errors/NotFound",
	{
		entityType: Schema.String,
		entityId: Schema.NullOr(Schema.Union(Schema.String, Schema.Number)),
	},
	HttpApiSchema.annotations({ status: 404, title: "NotFound" }),
) {
	override get message() {
		if (this.entityId) {
			return `${this.entityType} with identifier ${this.entityId} not found`
		}
		return `${this.entityType} not found`
	}

	static is(u: unknown): u is NotFound {
		return Predicate.isTagged(u, "@hazel/errors/NotFound")
	}
}

export class InternalServerError extends Schema.TaggedError<InternalServerError>()(
	"@superwall/schema/models/errors/InternalServerError",
	{
		...ErrorBaseSchema.fields,
		cause: Schema.Defect,
	},
	HttpApiSchema.annotations({
		status: 500,
		title: "InternalServerError",
		description: "An unexpected error occurred",
	}),
) {
	static is(u: unknown): u is InternalServerError {
		return Predicate.isTagged(u, "@superwall/schema/models/errors/InternalServerError")
	}
}
