import { v } from "convex/values"
import { mutation, query } from "../_generated/server"
import { User } from "../lib/activeRecords/user"
import { customMutation, customQuery } from "../lib/customFunctions"

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
