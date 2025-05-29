import { mutation, query } from "convex-hazel/_generated/server"
import { Account } from "convex-hazel/lib/activeRecords/account"
import { customMutation, customQuery } from "convex-hazel/lib/activeRecords/customFunctions"

export const accountQuery = customQuery(query, {
	args: {},
	input: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const account = await Account.fromIdentity(ctx, identity)

		return { ctx: { ...ctx, account }, args }
	},
})

export const accountMutation = customMutation(mutation, {
	args: {},
	input: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const account = await Account.fromIdentity(ctx, identity)

		return { ctx: { ...ctx, account }, args }
	},
})
