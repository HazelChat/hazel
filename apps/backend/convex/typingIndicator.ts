import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"
import { accountMutation, accountQuery } from "./middleware/withAccount"

import { asyncMap } from "convex-helpers"

// The duration in milliseconds to consider a user as "still typing".
// After this timeout, they will be considered to have stopped typing.
const TYPING_TIMEOUT = 5000 // 5 seconds

/**
 * Updates the "last typed" timestamp for a user in a room.
 * This is an "upsert" operation.
 * - If the user is not already marked as typing, a new document is created.
 * - If the user is already typing, their timestamp is updated.
 *
 * This mutation should be called from the client whenever the user types.
 */
export const update = accountMutation({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, { channelId }) => {
		const existing = await ctx.db
			.query("typingIndicators")
			.withIndex("by_accountId", (q) => q.eq("channelId", channelId).eq("accountId", ctx.account.id))
			.unique()

		if (existing) {
			await ctx.db.patch(existing._id, { lastTyped: Date.now() })
		} else {
			await ctx.db.insert("typingIndicators", {
				channelId,
				accountId: ctx.account.id,
				lastTyped: Date.now(),
			})
		}
	},
})

/**
 * Returns a list of users who are actively typing in a room.
 * This query filters out users whose `lastTyped` timestamp is older
 * than the `TYPING_TIMEOUT`.
 */
export const list = accountQuery({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, { channelId }) => {
		const threshold = Date.now() - TYPING_TIMEOUT

		const typingIndicators = await ctx.db
			.query("typingIndicators")
			.withIndex("by_channel_timestamp", (q) => q.eq("channelId", channelId).gt("lastTyped", threshold))
			.collect()

		const typingIndicatorsWithUsers = await asyncMap(typingIndicators, async (indicator) => {
			if (indicator.accountId === ctx.account.id) return null

			const account = await ctx.db.get(indicator.accountId)

			if (!account) return null

			return {
				...indicator,
				account,
			}
		})

		return typingIndicatorsWithUsers.filter((indicator) => indicator !== null)
	},
})

export const stop = accountMutation({
	args: {
		channelId: v.id("channels"),
	},
	handler: async (ctx, { channelId }) => {
		const existing = await ctx.db
			.query("typingIndicators")
			.withIndex("by_accountId", (q) => q.eq("channelId", channelId).eq("accountId", ctx.account.id))
			.unique()

		if (existing) {
			await ctx.db.delete(existing._id)
		}
	},
})

const STALE_TIMEOUT = 60 * 60 * 1000

/**
 * Internal mutation to clean up old, stale typing indicators from the database.
 * This is run by a cron job and is not intended to be called by the client.
 */
export const cleanupOld = internalMutation({
	handler: async (ctx) => {
		const threshold = Date.now() - STALE_TIMEOUT

		const staleIndicators = await ctx.db
			.query("typingIndicators")
			.withIndex("by_timestamp", (q) => q.lt("lastTyped", threshold))
			.take(100)

		await Promise.all(staleIndicators.map((doc) => ctx.db.delete(doc._id)))

		console.log(`Cleaned up ${staleIndicators.length} stale typing indicators.`)
	},
})
