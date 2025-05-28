import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { paginationOptsValidator } from "convex/server"
import { withUser } from "./middleware/authenticated"

export const getServers = query({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		return await ctx.db.query("servers").paginate(args.paginationOpts)
	},
})

export const createServer = mutation(
	withUser({
		args: {
			name: v.string(),
			slug: v.string(),
			imageUrl: v.optional(v.string()),
			ownerId: v.id("users"),
			type: v.union(v.literal("public"), v.literal("private")),
		},
		handler: async (ctx, args) => {
			const serverId = await ctx.db.insert("servers", {
				name: args.name,
				slug: args.slug,
				imageUrl: args.imageUrl,
				ownerId: args.ownerId,
				type: args.type,
				updatedAt: Date.now(),
			})

			await ctx.db.insert("serverMembers", {
				userId: args.ownerId,
				serverId: serverId,
				role: "owner",
				joinedAt: Date.now(),
			})

			return serverId
		},
	}),
)
