import { Schema } from "effect"

export const WorkOSUserId = Schema.NonEmptyTrimmedString.pipe(
	Schema.brand("@HazelChat/WorkOSUserId"),
).annotate({
	description: "A WorkOS user identifier",
	title: "WorkOS User ID",
})
export type WorkOSUserId = Schema.Schema.Type<typeof WorkOSUserId>

export const WorkOSOrganizationId = Schema.NonEmptyTrimmedString.pipe(
	Schema.brand("@HazelChat/WorkOSOrganizationId"),
).annotate({
	description: "A WorkOS organization identifier",
	title: "WorkOS Organization ID",
})
export type WorkOSOrganizationId = Schema.Schema.Type<typeof WorkOSOrganizationId>

export const WorkOSSessionId = Schema.NonEmptyTrimmedString.pipe(
	Schema.brand("@HazelChat/WorkOSSessionId"),
).annotate({
	description: "A WorkOS session identifier",
	title: "WorkOS Session ID",
})
export type WorkOSSessionId = Schema.Schema.Type<typeof WorkOSSessionId>

export const WorkOSInvitationId = Schema.NonEmptyTrimmedString.pipe(
	Schema.brand("@HazelChat/WorkOSInvitationId"),
).annotate({
	description: "A WorkOS invitation identifier",
	title: "WorkOS Invitation ID",
})
export type WorkOSInvitationId = Schema.Schema.Type<typeof WorkOSInvitationId>

export const WorkOSClientId = Schema.NonEmptyTrimmedString.pipe(
	Schema.brand("@HazelChat/WorkOSClientId"),
).annotate({
	description: "A WorkOS client identifier",
	title: "WorkOS Client ID",
})
export type WorkOSClientId = Schema.Schema.Type<typeof WorkOSClientId>

export const WorkOSRole = Schema.Literals(["admin", "member", "owner"])
export type WorkOSRole = Schema.Schema.Type<typeof WorkOSRole>

export class WorkOSJwtClaims extends Schema.Class<WorkOSJwtClaims>("WorkOSJwtClaims")({
	sub: WorkOSUserId,
	org_id: Schema.optional(WorkOSOrganizationId),
	email: Schema.optional(Schema.String),
	role: Schema.optional(WorkOSRole),
	sid: Schema.optional(WorkOSSessionId),
	exp: Schema.optional(Schema.Number),
}) {}
