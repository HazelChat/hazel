import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { query } from "./_generated/server"
import { accountMutation, accountQuery } from "./middleware/withAccount"

export const getServer = accountQuery({
	args: {
		serverId: v.id("servers"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("servers")
			.withIndex("by_id", (q) => q.eq("_id", args.serverId))
			.first()
	},
})

export const getServers = query({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		return await ctx.db.query("servers").paginate(args.paginationOpts)
	},
})

export const getServerForUser = accountQuery({
	args: {
		serverId: v.id("servers"),
	},
	handler: async (ctx, args) => {
		const serverMember = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.doc._id).eq("serverId", args.serverId),
			)
			.first()

		if (!serverMember) return null

		const server = await ctx.db.get(serverMember.serverId)

		return server
	},
})

export const getServersForUser = accountQuery({
	args: {},
	handler: async (ctx) => {
		const serverMembers = await ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) => q.eq("accountId", ctx.account.doc._id))
			.collect()

		const servers = await Promise.all(
			serverMembers.map(async (member) => {
				const server = await ctx.db.get(member.serverId)
				return server!
			}),
		)

		return servers
	},
})

export const createServer = accountMutation({
	args: {
		name: v.string(),
		imageUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const serverId = await ctx.db.insert("servers", {
			name: args.name,
			imageUrl: args.imageUrl,
			updatedAt: Date.now(),
		})

		const user = await ctx.account.createUserFromAccount({ ctx, serverId })

		await ctx.db.patch(serverId, {
			creatorId: user,
		})

		await ctx.db.insert("channels", {
			serverId: serverId,
			name: "general",
			type: "public",
			updatedAt: Date.now(),
			pinnedMessages: [],
		})

		return serverId
	},
})
