import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { userMutation, userQuery } from "./middleware/withUser"

export const getMessages = userQuery({
	args: {
		serverId: v.id("servers"),

		channelId: v.id("channels"),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		const channel = await ctx.db.get(args.channelId)
		if (!channel) throw new Error("Channel not found")

		await ctx.user.validateCanViewChannel({ ctx, channelId: args.channelId })

		// TODO: Set limits on pagination numbers
		const messages = await ctx.db
			.query("messages")
			.filter((q) => q.eq(q.field("channelId"), args.channelId))
			.order("desc")
			.paginate(args.paginationOpts)

		return messages
	},
})

export const createMessage = userMutation({
	args: {
		serverId: v.id("servers"),

		content: v.string(),
		channelId: v.id("channels"),
		threadChannelId: v.optional(v.id("channels")),
		authorId: v.id("users"),
		replyToMessageId: v.optional(v.id("messages")),
		attachedFiles: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateCanViewChannel({ ctx, channelId: args.channelId })

		const messageId = await ctx.db.insert("messages", {
			channelId: args.channelId,
			content: args.content,
			threadChannelId: args.threadChannelId,
			authorId: args.authorId,
			replyToMessageId: args.replyToMessageId,
			attachedFiles: args.attachedFiles,
			updatedAt: Date.now(),
		})

		return messageId
	},
})

export const updateMessage = userMutation({
	args: {
		serverId: v.id("servers"),

		id: v.id("messages"),
		content: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateOwnsMessage({ ctx, messageId: args.id })

		await ctx.db.patch(args.id, {
			content: args.content,
		})
	},
})

export const deleteMessage = userMutation({
	args: {
		serverId: v.id("servers"),

		id: v.id("messages"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateOwnsMessage({ ctx, messageId: args.id })

		await ctx.db.patch(args.id, {
			deletedAt: Date.now(),
		})
	},
})
