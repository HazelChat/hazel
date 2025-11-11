import { OrganizationId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { baseFields } from "./utils"

export class Model extends M.Class<Model>("Organization")({
	id: M.Generated(OrganizationId),
	name: Schema.String,
	slug: Schema.NullOr(Schema.String),
	logoUrl: Schema.NullOr(Schema.String),
	settings: Schema.NullOr(
		Schema.Record({
			key: Schema.String,
			value: Schema.Unknown,
		}),
	),
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
