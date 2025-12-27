import { UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { baseFields, JsonDate } from "./utils"

export const UserType = Schema.Literal("user", "machine")
export type UserType = Schema.Schema.Type<typeof UserType>

export class Model extends M.Class<Model>("User")({
	id: M.Generated(UserId),
	externalId: Schema.String,
	email: Schema.String,
	firstName: Schema.String,
	lastName: Schema.String,
	avatarUrl: Schema.String,
	userType: UserType,
	settings: Schema.NullOr(
		Schema.Record({
			key: Schema.String,
			value: Schema.Unknown,
		}),
	),
	isOnboarded: Schema.Boolean,
	timezone: Schema.NullOr(Schema.String),
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
