import { Schema } from "effect"

export const ClerkUserId = Schema.Trimmed.check(Schema.isNonEmpty())
	.pipe(Schema.brand("@HazelChat/ClerkUserId"))
	.annotate({
		description: "A Clerk user identifier (user_…)",
		title: "Clerk User ID",
	})
export type ClerkUserId = Schema.Schema.Type<typeof ClerkUserId>

export const ClerkOrganizationId = Schema.Trimmed.check(Schema.isNonEmpty())
	.pipe(Schema.brand("@HazelChat/ClerkOrganizationId"))
	.annotate({
		description: "A Clerk organization identifier (org_…)",
		title: "Clerk Organization ID",
	})
export type ClerkOrganizationId = Schema.Schema.Type<typeof ClerkOrganizationId>

export const ClerkSessionId = Schema.Trimmed.check(Schema.isNonEmpty())
	.pipe(Schema.brand("@HazelChat/ClerkSessionId"))
	.annotate({
		description: "A Clerk session identifier (sess_…)",
		title: "Clerk Session ID",
	})
export type ClerkSessionId = Schema.Schema.Type<typeof ClerkSessionId>

export const ClerkInvitationId = Schema.Trimmed.check(Schema.isNonEmpty())
	.pipe(Schema.brand("@HazelChat/ClerkInvitationId"))
	.annotate({
		description: "A Clerk invitation identifier",
		title: "Clerk Invitation ID",
	})
export type ClerkInvitationId = Schema.Schema.Type<typeof ClerkInvitationId>

export const ClerkOrganizationRole = Schema.Literals(["org:admin", "org:member"])
export type ClerkOrganizationRole = Schema.Schema.Type<typeof ClerkOrganizationRole>

export class ClerkJwtClaims extends Schema.Class<ClerkJwtClaims>("ClerkJwtClaims")({
	sub: ClerkUserId,
	sid: Schema.optional(ClerkSessionId),
	org_id: Schema.optional(ClerkOrganizationId),
	org_role: Schema.optional(Schema.String),
	org_slug: Schema.optional(Schema.String),
	azp: Schema.optional(Schema.String),
	email: Schema.optional(Schema.String),
	exp: Schema.optional(Schema.Number),
	iat: Schema.optional(Schema.Number),
}) {}
