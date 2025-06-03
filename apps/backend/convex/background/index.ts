import { internalMutation } from "@hazel/backend/server"
import { asyncMap } from "convex-helpers"
import { v } from "convex/values"
import { internal } from "../_generated/api"

const markdownToPlainText = (markdown: string): string => {
	if (!markdown) return ""

	let text = markdown

	// Remove code blocks first (triple backticks)
	text = text.replace(/```[\s\S]*?```/g, "[code block]")

	// Remove inline code (single backticks)
	text = text.replace(/`([^`]+)`/g, "$1")

	// Convert bold (**text** or __text__)
	text = text.replace(/(\*\*|__)(.*?)\1/g, "$2")

	// Convert italic (*text* or _text_)
	text = text.replace(/(\*|_)(.*?)\1/g, "$2")

	// Convert strikethrough (~~text~~)
	text = text.replace(/~~(.*?)~~/g, "$1")

	// Convert links [text](url) to just the text
	text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")

	// Remove headers (# ## ### etc)
	text = text.replace(/^#{1,6}\s+/gm, "")

	// Convert blockquotes (remove > )
	text = text.replace(/^>\s+/gm, "")

	// Convert unordered lists (remove - * +)
	text = text.replace(/^[\s]*[-\*\+]\s+/gm, "• ")

	// Convert ordered lists (remove numbers)
	text = text.replace(/^[\s]*\d+\.\s+/gm, "• ")

	// Remove horizontal rules
	text = text.replace(/^[-\*_]{3,}$/gm, "")

	// Clean up extra whitespace and newlines
	text = text.replace(/\n{3,}/g, "\n\n")
	text = text.replace(/^\s+|\s+$/g, "")

	return text
}

export const sendNotification = internalMutation({
	args: {
		userId: v.id("users"),
		messageId: v.id("messages"),
		accountId: v.id("accounts"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId)
		if (!message) return

		const author = await ctx.db.get(message.authorId)
		if (!author) return
		const channel = await ctx.db.get(args.channelId)
		if (!channel) return

		const server = await ctx.db.get(channel.serverId)
		if (!server) return

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

		await asyncMap(filteredChannelMembers, async (member) => {
			const user = await ctx.db.get(member.userId)
			if (!user) return
			const account = await ctx.db.get(user.accountId)

			if (!account) return

			const title =
				channel.type === "single" || channel.type === "direct"
					? `${author.displayName}`
					: `${author.displayName} (#${channel.name}, ${server.name})`

			const plainTextContent = markdownToPlainText(message.content)
			await ctx.scheduler.runAfter(0, internal.expo.sendPushNotification, {
				title: title,
				to: account._id,
				body: plainTextContent,
			})
		})
	},
})
