import type { InvitationRole } from "@hazel/domain/rpc"
import type { InvitationId, OrganizationId } from "@hazel/schema"
import { DateTime, Effect } from "effect"
import { HazelRpc } from "../rpc"

/** Organization email invitations (`invitation.*`), shared by settings, onboarding and the invite modal. */

export interface Invite {
	readonly email: string
	readonly role: InvitationRole
}

export interface InviteResults {
	readonly successCount: number
	readonly errorCount: number
}

/** Sends the invites, one `invitation.create` per role; skipped addresses count as failures. */
export const sendInvitations = (organizationId: OrganizationId, invites: ReadonlyArray<Invite>) =>
	Effect.gen(function* () {
		const client = yield* HazelRpc
		const roles = [...new Set(invites.map((invite) => invite.role))]
		const results = yield* Effect.forEach(
			roles,
			(role) => {
				const emails = invites
					.filter((invite) => invite.role === role)
					.map((invite) => invite.email.trim())
				return client("invitation.create", { organizationId, emails, role }).pipe(
					Effect.map((result) => ({
						successCount: result.invited.length,
						errorCount: result.skipped.length,
					})),
					Effect.tapError((error) => Effect.logError("Failed to send invitations", error)),
					Effect.orElseSucceed(() => ({ successCount: 0, errorCount: emails.length })),
				)
			},
			{ concurrency: "unbounded" },
		)
		return results.reduce<InviteResults>(
			(total, result) => ({
				successCount: total.successCount + result.successCount,
				errorCount: total.errorCount + result.errorCount,
			}),
			{ successCount: 0, errorCount: 0 },
		)
	})

export interface PendingInvitation {
	readonly id: InvitationId
	readonly emailAddress: string
	readonly role: InvitationRole
	readonly createdAtMs: number
}

export const listInvitations = (organizationId: OrganizationId) =>
	Effect.gen(function* () {
		const client = yield* HazelRpc
		const invitations = yield* client("invitation.list", { organizationId })
		return invitations.map(
			(invitation): PendingInvitation => ({
				id: invitation.id,
				emailAddress: invitation.email,
				role: invitation.role,
				createdAtMs: DateTime.toEpochMillis(invitation.createdAt),
			}),
		)
	})

export const revokeInvitation = (id: InvitationId) =>
	Effect.gen(function* () {
		const client = yield* HazelRpc
		yield* client("invitation.revoke", { id })
	})
