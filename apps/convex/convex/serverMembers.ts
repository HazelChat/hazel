import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { withUser } from "./middleware/authenticated"
export const getServerMembers = query({
	handler: async (ctx) => {
		return await ctx.db.query("serverMembers").collect()
	},
})

export const createServerMember = mutation(
	withUser({
		args: {
			userId: v.id("users"),
			serverId: v.id("servers"),
			role: v.union(v.literal("member"), v.literal("admin"), v.literal("owner")),
		},
		handler: async (ctx, args) => {
			return await ctx.db.insert("serverMembers", {
				userId: args.userId,
				serverId: args.serverId,
				role: args.role,
				joinedAt: Date.now(),
			})
		},
	}),
)
