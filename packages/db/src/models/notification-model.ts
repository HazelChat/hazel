import { Schema } from "effect"
import { NotificationId } from "../schema/ids"
import * as M from "../services/model"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("Notification")({
	id: M.Generated(NotificationId),
	memberId: Schema.UUID,
	targetedResourceId: Schema.NullOr(Schema.UUID),
	targetedResourceType: Schema.NullOr(Schema.String),
	resourceId: Schema.NullOr(Schema.UUID),
	resourceType: Schema.NullOr(Schema.String),
	readAt: Schema.NullOr(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update
