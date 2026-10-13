import { Schema } from "effect"
import { defineTaggedUnion } from "foldkit/schema"

export const Preview = Schema.Struct({
	organizationName: Schema.String,
	organizationLogoUrl: Schema.NullOr(Schema.String),
	email: Schema.String,
	status: Schema.Literals(["Pending", "Accepted", "Revoked", "Expired"]),
})
export type Preview = typeof Preview.Type

/** `invitation.preview`: the invite link's organization and status. */
export const Lookup = defineTaggedUnion({
	Loading: {},
	Loaded: { preview: Preview },
	NotFound: {},
	Failed: {},
})
export type Lookup = typeof Lookup.Type

export const Model = Schema.Struct({
	token: Schema.String,
	lookup: Lookup,
	isAccepting: Schema.Boolean,
	error: Schema.NullOr(Schema.String),
})
export type Model = typeof Model.Type
