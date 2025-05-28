import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { withUser } from "./middleware/authenticated"

export const getChannelMembers = query({
	handler: async (ctx) => {
		return await ctx.db.query("channelMembers").collect()
	},
})

export const createChannelMember = mutation(
	withUser({
		args: {
			userId: v.id("users"),
			channelId: v.id("serverChannels"),
			isHidden: v.boolean(),
			isMuted: v.boolean(),
			joinedAt: v.number(),
		},
		handler: async (ctx, args) => {
			if (!(await ctx.user.canViewChannel({ ctx, channelId: args.channelId }))) {
				throw new Error("You do not have access to this channel")
			}

			return await ctx.db.insert("channelMembers", {
				userId: args.userId,
				channelId: args.channelId,
				isHidden: args.isHidden,
				isMuted: args.isMuted,
				joinedAt: args.joinedAt,
			})
		},
	}),
)
