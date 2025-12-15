import { ChannelCategoryId, ChannelIcon, ChannelId, OrganizationId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { baseFields } from "./utils"

export const ChannelType = Schema.Literal("public", "private", "thread", "direct", "single")
export type ChannelType = Schema.Schema.Type<typeof ChannelType>

export class Model extends M.Class<Model>("Channel")({
	id: M.Generated(ChannelId),
	name: Schema.String,
	icon: Schema.NullOr(ChannelIcon),
	type: ChannelType,
	organizationId: OrganizationId,
	parentChannelId: Schema.NullOr(ChannelId),
	categoryId: Schema.NullOr(ChannelCategoryId),
	sortOrder: Schema.NullOr(Schema.String),
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
