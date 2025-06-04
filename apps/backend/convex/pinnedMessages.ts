import { asyncMap } from "convex-helpers"
import { v } from "convex/values"
import { userMutation, userQuery } from "./middleware/withUser"

export const getPinnedMessages = userQuery({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateCanViewChannel({ ctx, channelId: args.channelId })

		const channel = await ctx.db.get(args.channelId)
		if (!channel) throw new Error("Channel not found")

		const computedPinnedMessages = await asyncMap(channel.pinnedMessages, async (pinnedMessage) => {
			const message = await ctx.db.get(pinnedMessage.messageId)
			if (!message) return null

			const messageAuthor = await ctx.db.get(message.authorId)
			if (!messageAuthor) return null

			return {
				...pinnedMessage,
				channelId: args.channelId,
				messageAuthor,
				message,
			}
		})

		return computedPinnedMessages.filter((pinnedMessage) => pinnedMessage !== null)
	},
})

export const createPinnedMessage = userMutation({
	args: {
		messageId: v.id("messages"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateIsMemberOfChannel({ ctx, channelId: args.channelId })

		const channel = await ctx.db.get(args.channelId)
		if (!channel) throw new Error("Channel not found")

		const pinnedMessage = channel.pinnedMessages.find(
			(pinnedMessage) => pinnedMessage.messageId === args.messageId,
		)
		if (pinnedMessage) throw new Error("Message already pinned")

		await ctx.db.patch(args.channelId, {
			pinnedMessages: [...channel.pinnedMessages, { messageId: args.messageId, pinnedAt: Date.now() }],
		})
	},
})

export const deletePinnedMessage = userMutation({
	args: {
		messageId: v.id("messages"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateIsMemberOfChannel({ ctx, channelId: args.channelId })

		const channel = await ctx.db.get(args.channelId)
		if (!channel) throw new Error("Channel not found")

		return await ctx.db.patch(args.channelId, {
			pinnedMessages: channel.pinnedMessages.filter(
				(pinnedMessage) => pinnedMessage.messageId !== args.messageId,
			),
		})
	},
})
