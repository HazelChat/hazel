import { v } from "convex/values"
import { mutation } from "./_generated/server"
import { userMutation } from "./middleware/withUser"

export const createReaction = userMutation({
	args: {
		serverId: v.id("servers"),

		messageId: v.id("messages"),
		userId: v.id("users"),
		emoji: v.string(),
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId)
		if (!message) throw new Error("Message not found")

		await ctx.user.validateIsMemberOfChannel({ ctx, channelId: message.channelId })

		return await ctx.db.insert("reactions", {
			messageId: args.messageId,
			userId: args.userId,
			emoji: args.emoji,
		})
	},
})

export const deleteReaction = userMutation({
	args: {
		serverId: v.id("servers"),

		id: v.id("reactions"),
	},
	handler: async (ctx, args) => {
		const reaction = await ctx.db.get(args.id)
		if (!reaction) throw new Error("Reaction not found")

		await ctx.user.validateOwnsReaction({ ctx, reactionId: args.id })

		return await ctx.db.delete(args.id)
	},
})
