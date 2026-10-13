import { Schema } from "effect"

export const Model = Schema.Struct({
	/** From the OAuth callback's redirect; either missing means the link is unusable. */
	flowId: Schema.NullOr(Schema.String),
	reference: Schema.NullOr(Schema.String),
	firstName: Schema.String,
	lastName: Schema.String,
	/** Errors show after the first submit, not while the visitor is still typing. */
	hasSubmitted: Schema.Boolean,
	isSubmitting: Schema.Boolean,
	error: Schema.NullOr(Schema.String),
})
export type Model = typeof Model.Type

export const isFirstNameMissing = (model: Model) => model.firstName.trim().length === 0
