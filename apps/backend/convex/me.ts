import { v } from "convex/values"
import { accountQuery } from "./middleware/withAccount"
import { userQuery } from "./middleware/withUser"

export const get = accountQuery({
	args: {},
	handler: async (ctx) => {
		return ctx.account.doc
	},
})

export const getUser = accountQuery({
	args: {
		serverId: v.id("servers"),
	},
	handler: async (ctx, args) => {
		return ctx.db
			.query("users")
			.withIndex("by_accountId_serverId", (q) =>
				q.eq("accountId", ctx.account.id).eq("serverId", args.serverId),
			)
			.first()
	},
})

export const getLatestNotifcation = accountQuery({
	args: {},
	handler: async (ctx, _args) => {
		return ctx.db
			.query("notifications")
			.withIndex("by_accountId_targetedResourceId", (q) => q.eq("accountId", ctx.account.id))
			.order("desc")
			.first()
	},
})
