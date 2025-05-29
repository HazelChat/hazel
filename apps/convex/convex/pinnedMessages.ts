import { v } from "convex/values"
import { userMutation, userQuery } from "./middleware/withUser"

export const getPinnedMessages = userQuery({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateCanViewChannel({ ctx, channelId: args.channelId })

		return await ctx.db
			.query("pinnedMessages")
			.withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
			.collect()
	},
})

export const createPinnedMessage = userMutation({
	args: {
		serverId: v.id("servers"),

		messageId: v.id("messages"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateCanViewChannel({ ctx, channelId: args.channelId })

		return await ctx.db.insert("pinnedMessages", {
			messageId: args.messageId,
			channelId: args.channelId,
		})
	},
})

export const deletePinnedMessage = userMutation({
	args: {
		serverId: v.id("servers"),

		id: v.id("pinnedMessages"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateCanAccessPinnedMessage({ ctx, pinnedMessageId: args.id })

		return await ctx.db.delete(args.id)
	},
})
