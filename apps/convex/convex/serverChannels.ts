import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { withUser } from "./middleware/authenticated"

export const getServerChannels = query({
	handler: async (ctx) => {
		return await ctx.db.query("serverChannels").collect()
	},
})

export const createServerChannel = mutation(
	withUser({
		args: {
			name: v.string(),
			serverId: v.id("servers"),
			type: v.union(
				v.literal("public"),
				v.literal("private"),
				v.literal("thread"),
				v.literal("direct"),
				v.literal("single"),
			),
			ownerId: v.id("users"),
			parentChannelId: v.optional(v.id("serverChannels")),
		},
		handler: async (ctx, args) => {
			await ctx.user.validateIsMemberOfServer({ ctx, serverId: args.serverId })

			const channelId = await ctx.db.insert("serverChannels", {
				name: args.name,
				serverId: args.serverId,
				type: args.type,
				parentChannelId: args.parentChannelId,
				updatedAt: Date.now(),
			})

			await ctx.db.insert("channelMembers", {
				channelId,
				userId: args.ownerId,
				joinedAt: Date.now(),
				isHidden: false,
				isMuted: false,
			})

			return channelId
		},
	}),
)
