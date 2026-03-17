import { OrganizationId, OrganizationMemberId, UserId } from "@hazel/schema"
import { Schema as S } from "effect"
import * as M from "./utils"
import { baseFields, JsonDate } from "./utils"

export const OrganizationRole = S.Literals(["admin", "member", "owner"])
export type OrganizationRole = S.Schema.Type<typeof OrganizationRole>

class Model extends M.Class<Model>("OrganizationMember")({
	id: M.Generated(OrganizationMemberId),
	organizationId: OrganizationId,
	userId: M.GeneratedByApp(UserId),
	role: OrganizationRole,
	nickname: S.NullishOr(S.String),
	joinedAt: JsonDate,
	invitedBy: S.NullOr(UserId),
	deletedAt: S.NullOr(JsonDate),
	createdAt: M.Generated(JsonDate),
}) {}

export const { Insert, Update, Schema, Create, Patch } = M.expose(Model)
export type Type = typeof Schema.Type
