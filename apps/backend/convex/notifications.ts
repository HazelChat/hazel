import { v } from "convex/values"
import { asyncMap } from "convex-helpers"
import { Account } from "./lib/activeRecords/account"
import { userMutation } from "./middleware/withUser"

export const setNotifcationAsRead = userMutation({
	args: {
		serverId: v.id("servers"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, { channelId }) => {
		const channelMember = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", channelId).eq("userId", ctx.user.id))
			.first()

		if (!channelMember) throw new Error("You are not a member of this channel")

		const notifications = await ctx.db
			.query("notifications")
			.withIndex("by_accountId_targetedResourceId", (q) =>
				q.eq("accountId", ctx.user.accountId).eq("targetedResourceId", channelId),
			)
			.collect()

		await asyncMap(notifications, async (notification) => ctx.db.delete(notification._id))

		await ctx.db.patch(channelMember._id, { notificationCount: 0, lastSeenMessageId: undefined })
	},
})
