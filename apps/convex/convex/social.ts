import { userQuery } from "./middleware/withUser"

export const getFriends = userQuery({
	args: {},
	handler: async (ctx, args) => {
		const friends = await ctx.db
			.query("users")
			.withIndex("by_server_id", (q) => q.eq("serverId", args.serverId))
			.collect()

		return friends
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
