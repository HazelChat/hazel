import { PushNotifications } from "@convex-dev/expo-push-notifications"
import { v } from "convex/values"
import { components } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { internalMutation } from "./_generated/server"
import { accountMutation, accountQuery } from "./middleware/withAccount"

type UserId = Id<"users">

const pushNotifications = new PushNotifications<UserId>(components.pushNotifications)

export const recordPushNotificationToken = accountMutation({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		await pushNotifications.recordToken(ctx, {
			userId: ctx.account.id,
			pushToken: args.token,
		})
	},
})

export const getStatusForUser = accountQuery({
	args: {},
	handler: async (ctx) => {
		const res = await pushNotifications.getStatusForUser(ctx, {
			userId: ctx.account.id,
		})

		return res
	},
})

export const sendPushNotification = internalMutation({
	args: { title: v.string(), body: v.optional(v.string()), to: v.id("users") },
	handler: async (ctx, args) => {
		await pushNotifications.sendPushNotification(ctx, {
			userId: args.to,
			allowUnregisteredTokens: true,
			notification: {
				title: args.title,
				body: args.body,
			},
		})
	},
})
