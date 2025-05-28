import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { withUser } from "./middleware/authenticated"

export const getPinnedMessages = query({
	handler: async (ctx) => {
		return await ctx.db.query("pinnedMessages").collect()
	},
})

export const createPinnedMessage = mutation(
	withUser({
		args: {
			messageId: v.id("messages"),
			channelId: v.id("serverChannels"),
		},
		handler: async (ctx, args) => {
			await ctx.user.validateCanViewChannel({ ctx, channelId: args.channelId })

			return await ctx.db.insert("pinnedMessages", {
				messageId: args.messageId,
				channelId: args.channelId,
			})
		},
	}),
)

export const deletePinnedMessage = mutation(
	withUser({
		args: {
			id: v.id("pinnedMessages"),
		},
		handler: async (ctx, args) => {
			await ctx.user.validateCanAccessPinnedMessage({ ctx, pinnedMessageId: args.id })

			return await ctx.db.delete(args.id)
		},
	}),
)
