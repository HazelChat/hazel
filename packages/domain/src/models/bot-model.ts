import { BotId, UserId } from "@hazel/schema"
import { Schema as S } from "effect"
import { IntegrationProvider } from "./integration-connection-model"
import * as M from "./utils"
import { baseFields, JsonDate } from "./utils"

class Model extends M.Class<Model>("Bot")({
	id: M.Generated(BotId),
	userId: UserId,
	createdBy: UserId,
	name: S.String,
	description: S.NullOr(S.String),
	webhookUrl: S.NullOr(S.String),
	apiTokenHash: S.String,
	scopes: S.NullOr(S.Array(S.String)),
	metadata: S.NullOr(S.Record(S.String, S.Unknown)),
	isPublic: S.Boolean,
	installCount: S.Number,
	// List of integration providers this bot is allowed to use (e.g., ["linear", "github"])
	allowedIntegrations: S.NullOr(S.Array(IntegrationProvider)),
	// Whether this bot can be @mentioned in messages
	mentionable: S.Boolean,
	...baseFields,
}) {}

export const { Insert, Update, Schema, Create, Patch } = M.expose(Model)
export type Type = typeof Schema.Type
