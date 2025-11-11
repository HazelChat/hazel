import { Schema } from "effect"
import { ChannelId, OrganizationId } from "../schema/ids"
import * as M from "../services/model"
import { baseFields } from "./utils"

export const ChannelType = Schema.Literal("public", "private", "thread", "direct", "single")
export type ChannelType = Schema.Schema.Type<typeof ChannelType>

export class Model extends M.Class<Model>("Channel")({
	id: M.Generated(ChannelId),
	name: Schema.String,
	type: ChannelType,
	organizationId: OrganizationId,
	parentChannelId: Schema.NullOr(ChannelId),
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
