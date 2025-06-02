import { internalMutation } from "@hazel/backend/server"
import { asyncMap } from "convex-helpers"
import { v } from "convex/values"

export const sendNotification = internalMutation({
	args: {
		userId: v.id("users"),
		messageId: v.id("messages"),
		accountId: v.id("accounts"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		const channelMembers = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", args.channelId))
			.collect()

		const filteredChannelMembers = channelMembers.filter(
			(member) => !member.isMuted && member.userId !== args.userId,
		)

		await asyncMap(filteredChannelMembers, async (member) => {
			const user = await ctx.db.get(member.userId)
			if (!user) return
			const account = await ctx.db.get(user.accountId)

			if (!account) return

			await ctx.db.insert("notifications", {
				accountId: account._id,
				targetedResourceId: args.channelId,
				resourceId: args.messageId,
			})
		})
	},
})
