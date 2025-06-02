import { userQuery } from "./middleware/withUser"

export const getFriends = userQuery({
	args: {},
	handler: async (ctx, args) => {
		const friends = await ctx.db
			.query("users")
			.withIndex("by_server_id", (q) => q.eq("serverId", args.serverId))
			.collect()

		return friends.filter((f) => f._id !== ctx.user.id)
	},
})

export const getMembers = userQuery({
	args: {},
	handler: async (ctx, args) => {
		const friends = await ctx.db
			.query("users")
			.withIndex("by_server_id", (q) => q.eq("serverId", args.serverId))
			.collect()

		return friends
	},
})
