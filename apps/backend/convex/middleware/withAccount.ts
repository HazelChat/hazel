import { mutation, query } from "../_generated/server"
import { Account } from "../lib/activeRecords/account"
import { customMutation, customQuery } from "../lib/customFunctions"

export const accountQuery = customQuery(query, {
	args: {},
	input: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const account = await Account.fromIdentity(ctx, identity)

		return { ctx: { ...ctx, account, identity }, args }
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

		return { ctx: { ...ctx, account, identity }, args }
	},
})
