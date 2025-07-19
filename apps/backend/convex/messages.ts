import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { asyncMap } from "convex-helpers"
import { internal } from "./_generated/api"
import { organizationServerMutation, organizationServerQuery } from "./middleware/withOrganizationServer"
import { userMutation, userQuery } from "./middleware/withUser"

export const getMessageForOrganization = organizationServerQuery({
	args: {
		channelId: v.id("channels"),
		id: v.id("messages"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		// Validate user can view the channel
		const channel = await ctx.db.get(args.channelId)
		if (!channel) throw new Error("Channel not found")
		if (channel.serverId !== ctx.serverId) throw new Error("Channel not in this server")

		const message = await ctx.db.get(args.id)
		if (!message) throw new Error("Message not found")

		const messageAuthor = await ctx.db.get(message.authorId)
		if (!messageAuthor) throw new Error("Message author not found")

		return {
			...message,
			author: messageAuthor,
		}
	},
})

export const getMessage = userQuery({
	args: {
		serverId: v.id("servers"),
		channelId: v.id("channels"),
		id: v.id("messages"),
	},
	handler: async (ctx, args) => {
		await ctx.user.validateCanViewChannel({ ctx, channelId: args.channelId })

		const message = await ctx.db.get(args.id)
		if (!message) throw new Error("Message not found")

		const messageAuthor = await ctx.db.get(message.authorId)
		if (!messageAuthor) throw new Error("Message author not found")

		return {
			...message,
			author: messageAuthor,
		}
	},
})

export const getMessagesForOrganization = organizationServerQuery({
	args: {
		channelId: v.id("channels"),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		const channel = await ctx.db.get(args.channelId)
		if (!channel) throw new Error("Channel not found")
		if (channel.serverId !== ctx.serverId) throw new Error("Channel not in this server")

		// Validate user can view the channel
		// TODO: Add proper channel permission check here

		const messages = await ctx.db
			.query("messages")
			.withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
			.order("desc")
			.paginate(args.paginationOpts)

		const messagesWithThreadMessages = await asyncMap(messages.page, async (message) => {
			if (message.threadChannelId) {
				const threadMessages = await ctx.db
					.query("messages")
					.withIndex("by_channelId", (q) => q.eq("channelId", message.threadChannelId!))
					.order("desc")
					.collect()

				return {
					...message,
					threadMessages,
				}
			}

			return message
		})

		const messagesWithAuthors = await asyncMap(messagesWithThreadMessages, async (message) => {
			const author = await ctx.db.get(message.authorId)
			if (!author) throw new Error("Message author not found")

			return {
				...message,
				author,
			}
		})

		return {
			...messages,
			page: messagesWithAuthors,
		}
	},
})

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

		const messages = await ctx.db
			.query("messages")
			.withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
			.order("desc")
			.paginate(args.paginationOpts)

		const messagesWithThreadMessages = await asyncMap(messages.page, async (message) => {
			if (message.threadChannelId) {
				const threadMessages = await ctx.db
					.query("messages")
					.withIndex("by_channelId", (q) => q.eq("channelId", message.threadChannelId!))
					.collect()

				const threadMessagesWithAuthor = await asyncMap(threadMessages, async (message) => {
					const messageAuthor = await ctx.db.get(message.authorId)
					if (!messageAuthor) throw new Error("Message author not found")
					return {
						...message,
						author: messageAuthor,
					}
				})

				return {
					...message,
					threadMessages: threadMessagesWithAuthor,
				}
			}

			return {
				...message,
				threadMessages: [],
			}
		})

		const messagesWithAuthor = await asyncMap(messagesWithThreadMessages, async (message) => {
			const messageAuthor = await ctx.db.get(message.authorId)

			// TODO: This should not happen when user is deleted we should give all messages to a default user
			if (!messageAuthor) throw new Error("Message author not found")

			return {
				...message,
				author: messageAuthor,
			}
		})

		return {
			...messages,
			page: messagesWithAuthor,
		}
	},
})

export const createMessageForOrganization = organizationServerMutation({
	args: {
		content: v.string(),
		channelId: v.id("channels"),
		threadChannelId: v.optional(v.id("channels")),
		replyToMessageId: v.optional(v.id("messages")),
		attachedFiles: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		if (args.content.trim() === "") {
			throw new Error("Message content cannot be empty")
		}

		const user = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", ctx.serverId),
			)
			.first()

		if (!user) {
			throw new Error("User not found in this server")
		}

		// Validate channel belongs to this server
		const channel = await ctx.db.get(args.channelId)
		if (!channel) throw new Error("Channel not found")
		if (channel.serverId !== ctx.serverId) throw new Error("Channel not in this server")

		// TODO: Add proper channel membership validation

		const messageId = await ctx.db.insert("messages", {
			channelId: args.channelId,
			content: args.content,
			threadChannelId: args.threadChannelId,
			authorId: user._id,
			replyToMessageId: args.replyToMessageId,
			attachedFiles: args.attachedFiles,
			updatedAt: Date.now(),
			reactions: [],
		})

		// TODO: This should be a database trigger
		await ctx.scheduler.runAfter(0, internal.background.index.sendNotification, {
			channelId: args.channelId,
			accountId: user.accountId,
			messageId: messageId,
			userId: user._id,
		})

		return messageId
	},
})

export const createMessage = userMutation({
	args: {
		serverId: v.id("servers"),

		content: v.string(),
		channelId: v.id("channels"),
		threadChannelId: v.optional(v.id("channels")),
		replyToMessageId: v.optional(v.id("messages")),
		attachedFiles: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		if (args.content.trim() === "") {
			throw new Error("Message content cannot be empty")
		}

		await ctx.user.validateIsMemberOfChannel({ ctx, channelId: args.channelId })

		const messageId = await ctx.db.insert("messages", {
			channelId: args.channelId,
			content: args.content,
			threadChannelId: args.threadChannelId,
			authorId: ctx.user.id,
			replyToMessageId: args.replyToMessageId,
			attachedFiles: args.attachedFiles,
			updatedAt: Date.now(),
			reactions: [],
		})

		// TODO: This should be a database trigger
		await ctx.scheduler.runAfter(0, internal.background.index.sendNotification, {
			channelId: args.channelId,
			accountId: ctx.user.doc.accountId,
			messageId: messageId,
			userId: ctx.user.id,
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

		await ctx.db.delete(args.id)
	},
})

export const createReaction = userMutation({
	args: {
		serverId: v.id("servers"),

		messageId: v.id("messages"),
		emoji: v.string(),
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId)
		if (!message || message.deletedAt) throw new Error("Message not found")

		await ctx.user.validateIsMemberOfChannel({ ctx, channelId: message.channelId })

		if (
			message.reactions.some(
				(reaction) => reaction.userId === ctx.user.id && reaction.emoji === args.emoji,
			)
		) {
			throw new Error("You have already reacted to this message")
		}

		return await ctx.db.patch(args.messageId, {
			reactions: [...message.reactions, { userId: ctx.user.id, emoji: args.emoji }],
		})
	},
})

export const deleteReaction = userMutation({
	args: {
		serverId: v.id("servers"),

		id: v.id("messages"),
		emoji: v.string(),
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.id)
		if (!message) throw new Error("Message not found")

		await ctx.user.validateIsMemberOfChannel({ ctx, channelId: message.channelId })

		const newReactions = message.reactions.filter(
			(reaction) => !(reaction.emoji === args.emoji && reaction.userId === ctx.user.id),
		)

		if (newReactions.length === message.reactions.length) {
			throw new Error("You do not have permission to delete this reaction")
		}

		return await ctx.db.patch(args.id, {
			reactions: newReactions,
		})
	},
})
