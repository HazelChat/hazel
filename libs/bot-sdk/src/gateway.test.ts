import { describe, expect, it } from "@effect/vitest"
import type { BotId } from "@hazel/schema"
import { Effect } from "effect"
import {
	GatewaySessionStoreTag,
	InMemoryGatewaySessionStoreLive,
	readGatewayBatch,
} from "./gateway.ts"

const BOT_ID = "00000000-0000-0000-0000-000000000111" as BotId
const GATEWAY_URL = "http://localhost:3090"
const BOT_TOKEN = "test-token"

const commandEnvelope = [
	{
		schemaVersion: 1,
		deliveryId: "delivery-1",
		partitionKey: "org:00000000-0000-0000-0000-000000000333:channel:00000000-0000-0000-0000-000000000444",
		occurredAt: 1_700_000_000_000,
		idempotencyKey:
			"command:00000000-0000-0000-0000-000000000111:echo:00000000-0000-0000-0000-000000000444:1700000000000",
		eventType: "command.invoke",
		payload: {
			commandName: "echo",
			channelId: "00000000-0000-0000-0000-000000000444",
			userId: "00000000-0000-0000-0000-000000000222",
			orgId: "00000000-0000-0000-0000-000000000333",
			arguments: { text: "hello" },
			timestamp: 1_700_000_000_000,
		},
	},
]

describe("readGatewayBatch", () => {
	it("decodes durable gateway events and uses long-poll mode outside pull transport", async () => {
		const originalFetch = globalThis.fetch
		const requestedUrls: Array<string> = []

		globalThis.fetch = (async (input) => {
			requestedUrls.push(String(input))
			return new Response(JSON.stringify(commandEnvelope), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Stream-Next-Offset": "42",
				},
			})
		}) as typeof fetch

		try {
			const batch = await Effect.runPromise(
				readGatewayBatch({
					gatewayUrl: GATEWAY_URL,
					botToken: BOT_TOKEN,
					offset: "now",
					transport: "auto",
				}),
			)

			expect(batch.nextOffset).toBe("42")
			expect(batch.events).toHaveLength(1)
			expect(batch.events[0]?.eventType).toBe("command.invoke")
			expect(requestedUrls[0]).toContain("offset=now")
			expect(requestedUrls[0]).toContain("live=long-poll")
		} finally {
			globalThis.fetch = originalFetch
		}
	})

	it("omits live tail parameters in pull mode", async () => {
		const originalFetch = globalThis.fetch
		const requestedUrls: Array<string> = []

		globalThis.fetch = (async (input) => {
			requestedUrls.push(String(input))
			return new Response("[]", {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Stream-Next-Offset": "7",
				},
			})
		}) as typeof fetch

		try {
			await Effect.runPromise(
				readGatewayBatch({
					gatewayUrl: GATEWAY_URL,
					botToken: BOT_TOKEN,
					offset: "5",
					transport: "pull",
				}),
			)

			expect(requestedUrls[0]).toContain("offset=5")
			expect(requestedUrls[0]).not.toContain("live=")
		} finally {
			globalThis.fetch = originalFetch
		}
	})

	it("fails with GatewayDecodeError when the payload is invalid JSON", async () => {
		const originalFetch = globalThis.fetch

		globalThis.fetch = (async () =>
			new Response("{not-json", {
				status: 200,
				headers: { "Stream-Next-Offset": "9" },
			})) as typeof fetch

		try {
			await Effect.runPromise(
				readGatewayBatch({
					gatewayUrl: GATEWAY_URL,
					botToken: BOT_TOKEN,
					offset: "0",
					transport: "auto",
				}),
			).then(
				() => {
					throw new Error("Expected readGatewayBatch to fail")
				},
				(error) => {
					expect(String(error)).toContain("GatewayDecodeError")
				},
			)
		} finally {
			globalThis.fetch = originalFetch
		}
	})
})

describe("InMemoryGatewaySessionStoreLive", () => {
	it("loads and saves offsets per bot", () =>
		Effect.runPromise(
			Effect.gen(function* () {
				const store = yield* GatewaySessionStoreTag
				expect(yield* store.load(BOT_ID)).toBe(null)
				yield* store.save(BOT_ID, "11")
				expect(yield* store.load(BOT_ID)).toBe("11")
			}).pipe(Effect.provide(InMemoryGatewaySessionStoreLive)),
		))
})
