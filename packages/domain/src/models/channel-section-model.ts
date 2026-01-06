import { ChannelSectionId, OrganizationId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { baseFields } from "./utils"

export class Model extends M.Class<Model>("ChannelSection")({
	id: M.GeneratedOptional(ChannelSectionId),
	organizationId: OrganizationId,
	name: Schema.String,
	order: Schema.Number,
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
