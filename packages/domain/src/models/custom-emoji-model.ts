import { CustomEmojiId, OrganizationId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("CustomEmoji")({
	id: M.Generated(CustomEmojiId),
	organizationId: OrganizationId,
	name: Schema.String,
	imageUrl: Schema.String,
	createdBy: M.GeneratedByApp(UserId),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.Generated(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update
