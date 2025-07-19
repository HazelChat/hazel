import { organizationServerQuery } from "./middleware/withOrganizationServer"
import { userQuery } from "./middleware/withUser"

export const getFriendsForOrganization = organizationServerQuery({
	args: {},
	handler: async (ctx) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		const friends = await ctx.db
			.query("users")
			.withIndex("by_server_id", (q) => q.eq("serverId", ctx.serverId))
			.collect()

		return friends.filter((f) => f._id !== user._id)
	},
})

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

export const getMembersForOrganization = organizationServerQuery({
	args: {},
	handler: async (ctx) => {
		const members = await ctx.db
			.query("users")
			.withIndex("by_server_id", (q) => q.eq("serverId", ctx.serverId))
			.collect()

		return members
	},
})
