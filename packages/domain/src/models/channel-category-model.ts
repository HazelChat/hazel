import { ChannelCategoryId, OrganizationId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { baseFields } from "./utils"

export class Model extends M.Class<Model>("ChannelCategory")({
	id: M.Generated(ChannelCategoryId),
	name: Schema.String,
	organizationId: OrganizationId,
	sortOrder: Schema.String,
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
