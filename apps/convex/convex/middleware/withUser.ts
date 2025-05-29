import { mutation, query } from "convex-hazel/_generated/server"
import { customMutation, customQuery } from "convex-hazel/lib/activeRecords/customFunctions"
import { User } from "convex-hazel/lib/activeRecords/user"
import { v } from "convex/values"

export const userQuery = customQuery(query, {
	args: { serverId: v.id("servers") },
	input: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const user = await User.fromIdentity(ctx, identity, args.serverId)

		return { ctx: { ...ctx, user }, args }
	},
})

export const userMutation = customMutation(mutation, {
	args: { serverId: v.id("servers") },
	input: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const user = await User.fromIdentity(ctx, identity, args.serverId)

		return { ctx: { ...ctx, user }, args }
	},
})
