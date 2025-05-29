import { v } from "convex/values"
import { accountMutation } from "./middleware/withAccount"
import { userQuery } from "./middleware/withUser"

export const getUsers = userQuery({
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_serverId", (q) => q.eq("serverId", args.serverId))
			.collect()
	},
})

export const createUser = accountMutation({
	args: {
		serverId: v.id("servers"),
		role: v.union(v.literal("member"), v.literal("admin"), v.literal("owner")),
	},
	handler: async (ctx, args) => {
		// TODO: Add validation here
		return await ctx.account.createUserFromAccount({ ctx, serverId: args.serverId })
	},
})
