import { Schema } from "effect"
import { OrganizationId } from "../lib/schema"
import * as M from "../services/model"
import { baseFields } from "./utils"

export class Model extends M.Class<Model>("Organization")({
	id: M.Generated(OrganizationId),
	workosId: Schema.String,
	name: Schema.String,
	slug: Schema.NullOr(Schema.String),
	logoUrl: Schema.NullOr(Schema.String),
	settings: Schema.NullOr(
		Schema.Record({
			key: Schema.String,
			value: Schema.Any,
		}),
	),
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
