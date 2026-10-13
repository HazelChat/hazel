import { OrganizationId } from "@hazel/schema"
import { Schema } from "effect"
import * as CreateWorkspace from "../create-workspace"

export const UserOrganization = Schema.Struct({
	id: OrganizationId,
	name: Schema.String,
	slug: Schema.NullOr(Schema.String),
	logoUrl: Schema.NullOr(Schema.String),
	role: Schema.Literals(["owner", "admin", "member"]),
})
export type UserOrganization = typeof UserOrganization.Type

export const Model = Schema.Struct({
	/** `null` until the live query is ready. */
	organizations: Schema.NullOr(Schema.Array(UserOrganization)),
	hasRedirected: Schema.Boolean,
	/** Shown when the user has no organization. */
	createWorkspace: CreateWorkspace.Model,
})
export type Model = typeof Model.Type
