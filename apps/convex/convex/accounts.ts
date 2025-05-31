import { v } from "convex/values"
import { mutation } from "./_generated/server"
import { accountQuery } from "./middleware/withAccount"

export const getAccount = accountQuery({
	args: {
		id: v.id("accounts"),
	},
	handler: async (ctx, args) => {
		await ctx.account.validateCanViewAccount({ ctx, accountId: args.id })

		return await ctx.db.get(args.id)
	},
})

export const createAccount = mutation({
	args: {
		displayName: v.optional(v.string()),
		tag: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error("Called storeUser without authentication present")
		}

		const displayName = args.displayName || identity.name || "Unknown"

		const account = await ctx.db
			.query("accounts")
			.withIndex("bg_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique()

		if (account !== null) {
			if (account.displayName !== displayName) {
				await ctx.db.patch(account._id, { displayName })
			}
			return account._id
		}

		return await ctx.db.insert("accounts", {
			externalId: identity.subject,
			avatarUrl: identity.pictureUrl || `https://avatar.vercel.sh/${identity.subject}.svg`,
			displayName,
			// tag: args.tag?.toLowerCase() || identity.nickname?.toLowerCase() || identity.subject.toLowerCase(),
			// lastSeen: Date.now(),
			tokenIdentifier: identity.tokenIdentifier,
			// status: "offline",
		})
	},
})
