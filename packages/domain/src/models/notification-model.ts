import { NotificationId, OrganizationMemberId } from "@hazel/schema"
import { Schema as S } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

class Model extends M.Class<Model>("Notification")({
	id: M.Generated(NotificationId),
	memberId: OrganizationMemberId,
	targetedResourceId: S.NullOr(S.String.check(S.isUUID())),
	targetedResourceType: S.NullOr(S.String),
	resourceId: S.NullOr(S.String.check(S.isUUID())),
	resourceType: S.NullOr(S.String),
	createdAt: M.Generated(JsonDate),
	readAt: S.NullOr(JsonDate),
}) {}

export const { Insert, Update, Schema, Create, Patch } = M.expose(Model)
export type Type = typeof Schema.Type
