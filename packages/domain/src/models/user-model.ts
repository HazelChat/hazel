import { UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { baseFields } from "./utils"

export const UserType = Schema.Literal("user", "machine")
export type UserType = Schema.Schema.Type<typeof UserType>

/**
 * Time in HH:MM format (00:00 - 23:59)
 */
export const TimeString = Schema.String.pipe(
	Schema.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
	Schema.brand("TimeString"),
)
export type TimeString = Schema.Schema.Type<typeof TimeString>

/**
 * Schema for user settings stored in the database
 */
export const UserSettingsSchema = Schema.Struct({
	doNotDisturb: Schema.optional(Schema.Boolean),
	quietHoursStart: Schema.optional(TimeString),
	quietHoursEnd: Schema.optional(TimeString),
})
export type UserSettings = Schema.Schema.Type<typeof UserSettingsSchema>

export class Model extends M.Class<Model>("User")({
	id: M.Generated(UserId),
	externalId: Schema.String,
	email: Schema.String,
	firstName: Schema.String,
	lastName: Schema.String,
	avatarUrl: Schema.NonEmptyTrimmedString,
	userType: UserType,
	settings: Schema.NullOr(UserSettingsSchema),
	isOnboarded: Schema.Boolean,
	timezone: Schema.NullOr(Schema.String),
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
