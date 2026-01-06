import { ChannelIcon, ChannelId, ChannelSectionId, OrganizationId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { baseFields } from "./utils"

export const ChannelType = Schema.Literal("public", "private", "thread", "direct", "single")
export type ChannelType = Schema.Schema.Type<typeof ChannelType>

export class Model extends M.Class<Model>("Channel")({
	id: M.GeneratedOptional(ChannelId),
	name: Schema.String,
	icon: Schema.NullOr(ChannelIcon),
	type: ChannelType,
	organizationId: OrganizationId,
	parentChannelId: Schema.NullOr(ChannelId),
	sectionId: Schema.NullOr(ChannelSectionId),
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
