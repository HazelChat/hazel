import { v } from "convex/values"
import { internal } from "./_generated/api"
import { organizationServerMutation, organizationServerQuery } from "./middleware/withOrganization"

export const getInvitations = organizationServerQuery({
	args: {},
	handler: async (ctx, _args) => {
		// Get all invitations for the user's organization
		const invitations = await ctx.db
			.query("invitations")
			.withIndex("by_organizationId", (q) => q.eq("organizationId", ctx.organization._id))
			.filter((q) => q.eq(q.field("status"), "pending"))
			.order("desc")
			.collect()

		// Enrich invitations with inviter information
		const enrichedInvitations = await Promise.all(
			invitations.map(async (invitation) => {
				let inviterName = null
				if (invitation.invitedBy) {
					const inviter = await ctx.db.get(invitation.invitedBy)
					if (inviter) {
						inviterName = `${inviter.firstName} ${inviter.lastName}`.trim()
					}
				}

				return {
					...invitation,
					inviterName,
					timeUntilExpiry: invitation.expiresAt - Date.now(),
					isExpired: Date.now() > invitation.expiresAt,
				}
			}),
		)

		return enrichedInvitations
	},
})

export const resendInvitation = organizationServerMutation({
	args: {
		invitationId: v.id("invitations"),
	},
	handler: async (ctx, args) => {
		// Check if user has permission
		if (ctx.organizationMembership.role !== "admin") {
			throw new Error("Only admins can resend invitations")
		}

		const invitation = await ctx.db.get(args.invitationId)
		if (!invitation) {
			throw new Error("Invitation not found")
		}

		if (invitation.organizationId !== ctx.organization._id) {
			throw new Error("Invitation not found")
		}

		if (invitation.status !== "pending") {
			throw new Error("Can only resend pending invitations")
		}

		// First, revoke the existing invitation in WorkOS
		await ctx.scheduler.runAfter(0, internal.workosActions.revokeWorkosInvitation, {
			invitationId: invitation.workosInvitationId,
		})

		// Send a new invitation through WorkOS
		await ctx.scheduler.runAfter(0, internal.workosActions.sendInvitation, {
			email: invitation.email,
			organizationId: ctx.organization.workosId,
			inviterUserId: ctx.account.doc.externalId,
		})

		// Update the local invitation status
		// Note: The new invitation ID will be updated when the invitation.created webhook is received
		await ctx.db.patch(args.invitationId, {
			invitedAt: Date.now(),
			// Reset expiration to 7 days from now as a placeholder
			expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
		})

		return { success: true, message: "Invitation resent successfully" }
	},
})

export const revokeInvitation = organizationServerMutation({
	args: {
		invitationId: v.id("invitations"),
	},
	handler: async (ctx, args) => {
		if (ctx.organizationMembership.role !== "admin") {
			throw new Error("Only admins can revoke invitations")
		}

		const invitation = await ctx.db.get(args.invitationId)
		if (!invitation) {
			throw new Error("Invitation not found")
		}

		if (invitation.organizationId !== ctx.organization._id) {
			throw new Error("Invitation not found")
		}

		if (invitation.status !== "pending") {
			throw new Error("Can only revoke pending invitations")
		}

		// Revoke the invitation in WorkOS
		await ctx.scheduler.runAfter(0, internal.workosActions.revokeWorkosInvitation, {
			invitationId: invitation.workosInvitationId,
		})

		// Update status to revoked
		await ctx.db.patch(args.invitationId, {
			status: "revoked",
		})

		return { success: true, message: "Invitation revoked successfully" }
	},
})
