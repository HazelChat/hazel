import { Schema } from "effect"

export const Model = Schema.Struct({
	/** `null` when `?provider=` is missing or not one the API offers. */
	provider: Schema.NullOr(Schema.String),
	error: Schema.NullOr(Schema.String),
})
export type Model = typeof Model.Type
