import { v } from "convex/values"
import { asyncMap } from "convex-helpers"
import { userMutation } from "./middleware/withUser"

export const setNotifcationAsRead = userMutation({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, { channelId }) => {
		const channelMember = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", channelId).eq("userId", ctx.user.id))
			.first()

		if (!channelMember) throw new Error("You are not a member of this channel")

		// Get the user's membership in this organization
		const membership = ctx.user.membership
		if (!membership) throw new Error("User not a member of this organization")

		const notifications = await ctx.db
			.query("notifications")
			.withIndex("by_memberId_targetedResourceId", (q) =>
				q.eq("memberId", membership._id).eq("targetedResourceId", channelId),
			)
			.collect()

		await asyncMap(notifications, async (notification) => ctx.db.delete(notification._id))

		await ctx.db.patch(channelMember._id, { notificationCount: 0, lastSeenMessageId: undefined })
	},
})
