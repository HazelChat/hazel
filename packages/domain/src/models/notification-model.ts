import { NotificationId, OrganizationMemberId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("Notification")({
	id: M.Generated(NotificationId),
	memberId: OrganizationMemberId,
	targetedResourceId: Schema.NullOr(Schema.UUID),
	targetedResourceType: Schema.NullOr(Schema.String),
	resourceId: Schema.NullOr(Schema.UUID),
	resourceType: Schema.NullOr(Schema.String),
	createdAt: M.Generated(JsonDate),
	readAt: Schema.NullOr(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update
