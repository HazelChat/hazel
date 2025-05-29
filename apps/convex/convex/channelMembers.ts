import { v } from "convex/values"
import { userMutation, userQuery } from "./middleware/withUser"

export const getChannelMembers = userQuery({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("channelMembers")
			.filter((q) => q.eq(q.field("channelId"), args.channelId))
			.collect()
	},
})

export const createChannelMember = userMutation({
	args: {
		userId: v.id("users"),
		channelId: v.id("channels"),
		isHidden: v.boolean(),
		isMuted: v.boolean(),
		joinedAt: v.number(),

		serverId: v.id("servers"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateIsMemberOfChannel({ ctx, channelId: args.channelId })

		return await ctx.db.insert("channelMembers", {
			userId: args.userId,
			channelId: args.channelId,
			isHidden: args.isHidden,
			isMuted: args.isMuted,
			joinedAt: args.joinedAt,
		})
	},
})
