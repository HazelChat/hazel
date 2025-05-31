import { v } from "convex/values"
import { accountMutation } from "./middleware/withAccount"
import { userQuery } from "./middleware/withUser"

export const getUsers = userQuery({
	args: {},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_server_id", (q) => q.eq("serverId", args.serverId))
			.collect()
	},
})

export const getUser = userQuery({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId)
		if (!user) throw new Error("User not found")
		if (user.serverId !== args.serverId) throw new Error("User not found")
		return user
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
