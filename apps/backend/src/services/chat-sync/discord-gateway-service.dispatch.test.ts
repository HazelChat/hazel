import { describe, expect, it } from "@effect/vitest"
import type { ExternalChannelId, SyncConnectionId } from "@hazel/schema"
import { Effect } from "effect"
import { recordChatSyncDiagnostic } from "../../test/chat-sync-test-diagnostics"
import {
	createDiscordGatewayDispatchHandlers,
	type DiscordMessageCreateEvent,
	type DiscordMessageDeleteEvent,
	type DiscordMessageReactionAddEvent,
	type DiscordMessageUpdateEvent,
	type DiscordThreadCreateEvent,
} from "./discord-gateway-service"

const run = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
	Effect.runPromise(effect as Effect.Effect<A, E, never>)

type GatewayLink = {
	syncConnectionId: SyncConnectionId
	direction: "both" | "hazel_to_external" | "external_to_hazel"
}

const makeDispatchHarness = () => {
	const linksByChannel = new Map<string, ReadonlyArray<GatewayLink>>()
	const calls = {
		create: [] as Array<Record<string, unknown>>,
		update: [] as Array<Record<string, unknown>>,
		delete: [] as Array<Record<string, unknown>>,
		reactionAdd: [] as Array<Record<string, unknown>>,
		reactionRemove: [] as Array<Record<string, unknown>>,
		threadCreate: [] as Array<Record<string, unknown>>,
	}

	const handlers = createDiscordGatewayDispatchHandlers({
		discordSyncWorker: {
			ingestMessageCreate: (payload: any) =>
				Effect.sync(() => {
					calls.create.push(payload as Record<string, unknown>)
				}),
			ingestMessageUpdate: (payload: any) =>
				Effect.sync(() => {
					calls.update.push(payload as Record<string, unknown>)
				}),
			ingestMessageDelete: (payload: any) =>
				Effect.sync(() => {
					calls.delete.push(payload as Record<string, unknown>)
				}),
			ingestReactionAdd: (payload: any) =>
				Effect.sync(() => {
					calls.reactionAdd.push(payload as Record<string, unknown>)
				}),
			ingestReactionRemove: (payload: any) =>
				Effect.sync(() => {
					calls.reactionRemove.push(payload as Record<string, unknown>)
				}),
			ingestThreadCreate: (payload: any) =>
				Effect.sync(() => {
					calls.threadCreate.push(payload as Record<string, unknown>)
				}),
		} as any,
		findActiveLinksByExternalChannel: (externalChannelId) =>
			Effect.succeed(linksByChannel.get(externalChannelId) ?? []),
		isCurrentBotAuthor: (authorId) => Effect.succeed(authorId === "bot-self"),
	})

	return {
		handlers,
		calls,
		setLinks: (channelId: ExternalChannelId, links: ReadonlyArray<GatewayLink>) => {
			linksByChannel.set(channelId, links)
		},
	}
}

describe("DiscordGatewayService dispatch handlers", () => {
	it("routes MESSAGE_CREATE for inbound-capable links and keeps dedupe key stable", async () => {
		const harness = makeDispatchHarness()
		const channelId = "123456789012345678" as ExternalChannelId
		harness.setLinks(channelId, [
			{
				syncConnectionId: "00000000-0000-0000-0000-000000000001" as SyncConnectionId,
				direction: "both",
			},
			{
				syncConnectionId: "00000000-0000-0000-0000-000000000002" as SyncConnectionId,
				direction: "hazel_to_external",
			},
		])

		await run(
			harness.handlers.ingestMessageCreateEvent({
				id: "223456789012345678",
				channel_id: channelId,
				content: "hello",
				author: {
					id: "778899",
					username: "alice",
				},
			} satisfies DiscordMessageCreateEvent),
		)

		expect(harness.calls.create).toHaveLength(1)
		recordChatSyncDiagnostic({
			suite: "discord-gateway-dispatch",
			testCase: "message-create-routing",
			workerMethod: "ingestMessageCreate",
			action: "dispatch",
			dedupeKey: String(harness.calls.create[0]?.dedupeKey),
			syncConnectionId: String(harness.calls.create[0]?.syncConnectionId),
			expected: "one inbound dispatch for both-direction link",
			actual: `${harness.calls.create.length} dispatches`,
		})
		expect(harness.calls.create[0]?.syncConnectionId).toBe(
			"00000000-0000-0000-0000-000000000001",
		)
		expect(harness.calls.create[0]?.dedupeKey).toBe("discord:gateway:create:223456789012345678")
	})

	it("drops malformed MESSAGE_DELETE ids and does not dispatch", async () => {
		const harness = makeDispatchHarness()

		await run(
			harness.handlers.ingestMessageDeleteEvent({
				id: 123 as unknown as string,
				channel_id: "123456789012345678",
			} satisfies DiscordMessageDeleteEvent),
		)

		expect(harness.calls.delete).toHaveLength(0)
	})

	it("suppresses bot-authored and self-authored message events", async () => {
		const harness = makeDispatchHarness()
		const channelId = "123456789012345678" as ExternalChannelId
		harness.setLinks(channelId, [
			{
				syncConnectionId: "00000000-0000-0000-0000-000000000011" as SyncConnectionId,
				direction: "both",
			},
		])

		await run(
			harness.handlers.ingestMessageCreateEvent({
				id: "223456789012345678",
				channel_id: channelId,
				content: "ignored",
				author: { id: "bot-1", bot: true },
			}),
		)
		await run(
			harness.handlers.ingestMessageCreateEvent({
				id: "223456789012345679",
				channel_id: channelId,
				content: "ignored-2",
				author: { id: "bot-self", username: "hazel-bot" },
			}),
		)

		expect(harness.calls.create).toHaveLength(0)
	})

	it("routes MESSAGE_UPDATE and derives deterministic hash-based dedupe when edited timestamp is missing", async () => {
		const harness = makeDispatchHarness()
		const channelId = "123456789012345678" as ExternalChannelId
		harness.setLinks(channelId, [
			{
				syncConnectionId: "00000000-0000-0000-0000-000000000021" as SyncConnectionId,
				direction: "external_to_hazel",
			},
		])

		await run(
			harness.handlers.ingestMessageUpdateEvent({
				id: "223456789012345678",
				channel_id: channelId,
				content: "changed",
				webhook_id: 999 as unknown as string,
			} satisfies DiscordMessageUpdateEvent),
		)

		expect(harness.calls.update).toHaveLength(1)
		const dedupe = String(harness.calls.update[0]?.dedupeKey)
		expect(dedupe.startsWith("discord:gateway:update:223456789012345678:")).toBe(true)
		expect(dedupe.split(":")[4]?.length).toBe(16)
		expect(harness.calls.update[0]?.externalWebhookId).toBeUndefined()
	})

	it("routes reaction add/remove with direction filter and custom emoji formatting", async () => {
		const harness = makeDispatchHarness()
		const channelId = "123456789012345678" as ExternalChannelId
		harness.setLinks(channelId, [
			{
				syncConnectionId: "00000000-0000-0000-0000-000000000031" as SyncConnectionId,
				direction: "both",
			},
			{
				syncConnectionId: "00000000-0000-0000-0000-000000000032" as SyncConnectionId,
				direction: "hazel_to_external",
			},
		])

		const reactionEvent: DiscordMessageReactionAddEvent = {
			channel_id: channelId,
			message_id: "223456789012345678",
			user_id: "998877665544332211",
			emoji: {
				name: "party_blob",
				id: "445566778899001122",
			},
		}

		await run(harness.handlers.ingestMessageReactionAddEvent(reactionEvent))
		await run(
			harness.handlers.ingestMessageReactionRemoveEvent({
				...reactionEvent,
			} as any),
		)

		expect(harness.calls.reactionAdd).toHaveLength(1)
		expect(harness.calls.reactionRemove).toHaveLength(1)
		expect(harness.calls.reactionAdd[0]?.emoji).toBe("party_blob:445566778899001122")
		expect(harness.calls.reactionAdd[0]?.dedupeKey).toBe(
			"discord:gateway:reaction:add:123456789012345678:223456789012345678:998877665544332211:party_blob:445566778899001122",
		)
	})

	it("routes THREAD_CREATE only for thread types and inbound-capable links", async () => {
		const harness = makeDispatchHarness()
		const parentChannelId = "123456789012345678" as ExternalChannelId
		harness.setLinks(parentChannelId, [
			{
				syncConnectionId: "00000000-0000-0000-0000-000000000041" as SyncConnectionId,
				direction: "both",
			},
		])

		await run(
			harness.handlers.ingestThreadCreateEvent({
				id: "323456789012345678",
				parent_id: parentChannelId,
				type: 10,
				name: "ignore-non-thread",
			} satisfies DiscordThreadCreateEvent),
		)
		await run(
			harness.handlers.ingestThreadCreateEvent({
				id: "323456789012345679",
				parent_id: parentChannelId,
				type: 11,
				name: "new-thread",
			} satisfies DiscordThreadCreateEvent),
		)

		expect(harness.calls.threadCreate).toHaveLength(1)
		expect(harness.calls.threadCreate[0]?.dedupeKey).toBe(
			"discord:gateway:thread:create:323456789012345679",
		)
	})
})
