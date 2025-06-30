import { accountMutation } from "./middleware/withAccount"
import { v } from "convex/values"
import type { Id } from "@hazel/backend"

export const acceptInvite = accountMutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // Find invite by code
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique()

    if (!invite) {
      throw new Error("Invite not found or invalid")
    }

    // Expiry / revocation checks
    if (invite.expiresAt && invite.expiresAt < Date.now()) {
      throw new Error("Invite has expired")
    }
    if (invite.revokedAt) {
      throw new Error("Invite has been revoked")
    }

    // Create user/member if not already in server
    const account = ctx.account
    const userId = await account.createUserFromAccount({ ctx, serverId: invite.serverId as Id<"servers"> })

    // Optionally mark invite as used (single-use)
    // await ctx.db.patch(invite._id, { revokedAt: Date.now() })

    return invite.serverId
  },
})

export const createInvite = accountMutation({
  args: {
    serverId: v.id("servers"),
    expiresInHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Ensure requesting user is a member & owner/admin (simplified: just member)
    const membership = await ctx.db
      .query("users")
      .withIndex("by_accountId_serverId", (q) =>
        q.eq("accountId", ctx.account.doc._id).eq("serverId", args.serverId),
      )
      .unique()

    if (!membership) {
      throw new Error("You are not a member of this server")
    }

    // Generate unique code
    let code: string
    let attempts = 0
    while (true) {
      code = Math.random().toString(36).substring(2, 8)
      const existing = await ctx.db
        .query("invites")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique()
      if (!existing) break
      attempts++
      if (attempts > 5) throw new Error("Failed to generate invite code")
    }

    const inviteId = await ctx.db.insert("invites", {
      serverId: args.serverId,
      creatorId: membership._id as Id<"users">,
      code,
      expiresAt: args.expiresInHours ? Date.now() + args.expiresInHours * 3600_000 : undefined,
      createdAt: Date.now(),
    })

    return { inviteId, code }
  },
})
