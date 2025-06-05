import type { Id } from "@hazel/backend"
import { type TestConvex, type TestConvexForDataModel, convexTest as _convexTest } from "convex-test"
import { vi } from "vitest"
import { api } from "../../convex/_generated/api"
import schema from "../../convex/schema"
import { modules } from "../../convex/test.setup"

export function randomIdentity(convexTest: TestConvex<typeof schema>) {
	return convexTest.withIdentity({ tokenIdentifier: crypto.randomUUID(), subject: crypto.randomUUID() })
}

export function convexTest() {
	const t = _convexTest(schema, modules)

	return t
}

export async function createAccount(
	t: TestConvex<typeof schema> | TestConvexForDataModel<(typeof schema)["schemaValidation"]>,
	props?: { displayName?: string },
) {
	const displayName = props?.displayName || "Alice"
	return await t.mutation(api.accounts.createAccount, { displayName })
}

export async function createServer(
	t: TestConvex<typeof schema> | TestConvexForDataModel<(typeof schema)["schemaValidation"]>,
	props?: { name?: string },
) {
	const name = props?.name || "Test Server"
	return await t.mutation(api.servers.createServer, { name })
}

export async function createServerAndAccount(
	t: TestConvex<typeof schema> | TestConvexForDataModel<(typeof schema)["schemaValidation"]>,
) {
	const account = await createAccount(t)
	const server = await createServer(t)
	return { account, server }
}

export async function createUser(
	t: TestConvex<typeof schema> | TestConvexForDataModel<(typeof schema)["schemaValidation"]>,
	props: { role?: "member" | "admin" | "owner"; serverId: Id<"servers"> },
) {
	const role = props.role || "member"
	return await t.mutation(api.users.createUser, { role, serverId: props.serverId })
}

export async function createChannel(
	t: TestConvex<typeof schema> | TestConvexForDataModel<(typeof schema)["schemaValidation"]>,
	props: { serverId: Id<"servers">; type?: "public" | "private" },
) {
	return await t.mutation(api.channels.createChannel, {
		serverId: props.serverId,
		name: "Test Channel",
		type: props.type || "public",
	})
}

export async function createMessage(
	t: TestConvex<typeof schema> | TestConvexForDataModel<(typeof schema)["schemaValidation"]>,
	props: {
		serverId: Id<"servers">
		channelId: Id<"channels">
		content?: string
		replyToMessageId?: Id<"messages">
		threadChannelId?: Id<"channels">
		attachedFiles?: string[]
	},
) {
	vi.useFakeTimers()

	const message = await t.mutation(api.messages.createMessage, {
		serverId: props.serverId,
		channelId: props.channelId,
		content: props.content ?? "Test message content",
		replyToMessageId: props.replyToMessageId,
		threadChannelId: props.threadChannelId,
		attachedFiles: props.attachedFiles || [],
	})

	await t.finishAllScheduledFunctions(vi.runAllTimers)

	return message
}
