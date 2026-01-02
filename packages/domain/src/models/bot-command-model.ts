import { BotCommandId, BotId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { Generated, JsonDate } from "./utils"

/**
 * Argument definition for a bot command
 */
export const BotCommandArgument = Schema.Struct({
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	required: Schema.Boolean,
	placeholder: Schema.NullOr(Schema.String),
	type: Schema.Literal("string", "number", "user", "channel"),
})
export type BotCommandArgument = typeof BotCommandArgument.Type

export class Model extends M.Class<Model>("BotCommand")({
	id: M.Generated(BotCommandId),
	botId: BotId,
	name: Schema.String,
	description: Schema.String,
	arguments: Schema.NullOr(Schema.Array(BotCommandArgument)),
	usageExample: Schema.NullOr(Schema.String),
	isEnabled: Schema.Boolean,
	createdAt: Generated(JsonDate),
	updatedAt: Generated(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update
