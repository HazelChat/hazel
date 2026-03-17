import { describe, expect, it } from "@effect/vitest"
import { BotInstallationRepo, ChannelRepo } from "@hazel/backend-core"
import { createBotGatewayPartitionKey } from "@hazel/domain"
import { Message } from "@hazel/domain/models"
import type { BotId, ChannelId, MessageId, OrganizationId, UserId } from "@hazel/schema"
import { Effect, Layer, Option, Schema } from "effect"
import { configLayer, serviceShape } from "../test/effect-helpers"
import { BotGatewayService } from "./bot-gateway-service"

const DURABLE_STREAMS_URL = "http://durable.test/v1/stream"
const BOT_ID = "00000000-0000-4000-8000-000000000111" as BotId
const SECOND_BOT_ID = "00000000-0000-4000-8000-000000000112" as BotId
const CHANNEL_ID = "00000000-0000-4000-8000-000000000444" as ChannelId
const ORG_ID = "00000000-0000-4000-8000-000000000333" as OrganizationId
const USER_ID = "00000000-0000-4000-8000-000000000222" as UserId
const MESSAGE_ID = "00000000-0000-4000-8000-000000000555" as MessageId

const TestConfigLive = configLayer({
	DURABLE_STREAMS_URL,
})

const makeBotInstallationRepoLayer = (botIds: ReadonlyArray<BotId>) =>
	Layer.succeed(
		BotInstallationRepo,
		serviceShape<typeof BotInstallationRepo>({
			getBotIdsForOrg: () => Effect.succeed([...botIds]),
		}),
	)

const makeChannelRepoLayer = (organizationId: OrganizationId) =>
	Layer.succeed(
		ChannelRepo,
		serviceShape<typeof ChannelRepo>({
			findById: (id: ChannelId) =>
				Effect.succeed(
					Option.some({
						id,
						organizationId,
					}),
				),
		}),
	)

const makeServiceLayer = (botIds: ReadonlyArray<BotId>) =>
	Layer.effect(BotGatewayService, BotGatewayService.make).pipe(
		Layer.provide(makeBotInstallationRepoLayer(botIds)),
		Layer.provide(makeChannelRepoLayer(ORG_ID)),
		Layer.provide(TestConfigLive),
	)

describe("BotGatewayService", () => {
	it("ensures the stream and appends command events before returning", () => {
		const originalFetch = globalThis.fetch
		const requests: Array<{ url: string; method: string; body: string | null }> = []

		globalThis.fetch = (async (input, init) => {
			requests.push({
				url: String(input),
				method: init?.method ?? "GET",
				body: typeof init?.body === "string" ? init.body : null,
			})
			return new Response("", { status: init?.method === "PUT" ? 201 : 200 })
		}) as typeof fetch

		return Effect.runPromise(
			Effect.gen(function* () {
				const gateway = yield* BotGatewayService
				yield* gateway.publishCommand(BOT_ID, {
					commandName: "echo",
					channelId: CHANNEL_ID,
					userId: USER_ID,
					orgId: ORG_ID,
					arguments: { text: "hello" },
					timestamp: 1_700_000_000_000,
				})

				expect(requests).toHaveLength(2)
				expect(requests[0]).toMatchObject({
					url: `${DURABLE_STREAMS_URL}/bots/${BOT_ID}/gateway`,
					method: "PUT",
				})
				expect(requests[1]).toMatchObject({
					url: `${DURABLE_STREAMS_URL}/bots/${BOT_ID}/gateway`,
					method: "POST",
				})

				const body = JSON.parse(requests[1]!.body ?? "{}")
				expect(body.eventType).toBe("command.invoke")
				expect(body.partitionKey).toBe(
					createBotGatewayPartitionKey({
						organizationId: ORG_ID,
						channelId: CHANNEL_ID,
						botId: BOT_ID,
					}),
				)
				expect(body.payload.commandName).toBe("echo")
			}).pipe(
				Effect.provide(makeServiceLayer([BOT_ID])),
				Effect.ensuring(
					Effect.sync(() => {
						globalThis.fetch = originalFetch
					}),
				),
			),
		)
	})

	it("fans message events out to every bot installed in the organization", () => {
		const originalFetch = globalThis.fetch
		const requests: Array<{ url: string; method: string; body: string | null }> = []
		const message = {
			id: MESSAGE_ID,
			channelId: CHANNEL_ID,
			conversationId: null,
			authorId: USER_ID,
			content: "hello from hazel",
			embeds: null,
			replyToMessageId: null,
			threadChannelId: null,
			createdAt: new Date("2026-03-05T12:00:00.000Z"),
			updatedAt: null,
			deletedAt: null,
		} satisfies Schema.Schema.Type<typeof Message.Schema>

		globalThis.fetch = (async (input, init) => {
			requests.push({
				url: String(input),
				method: init?.method ?? "GET",
				body: typeof init?.body === "string" ? init.body : null,
			})
			return new Response("", { status: init?.method === "PUT" ? 201 : 200 })
		}) as typeof fetch

		return Effect.runPromise(
			Effect.gen(function* () {
				const gateway = yield* BotGatewayService
				yield* gateway.publishMessageEvent("message.create", message)

				const appendRequests = requests.filter((request) => request.method === "POST")
				expect(appendRequests).toHaveLength(2)

				const payloads = appendRequests.map((request) => JSON.parse(request.body ?? "{}"))
				expect(payloads.map((payload) => payload.eventType)).toEqual([
					"message.create",
					"message.create",
				])
				expect(payloads.map((payload) => payload.partitionKey)).toEqual([
					createBotGatewayPartitionKey({
						organizationId: ORG_ID,
						channelId: CHANNEL_ID,
					}),
					createBotGatewayPartitionKey({
						organizationId: ORG_ID,
						channelId: CHANNEL_ID,
					}),
				])
				expect(appendRequests.map((request) => request.url).sort()).toEqual([
					`${DURABLE_STREAMS_URL}/bots/${BOT_ID}/gateway`,
					`${DURABLE_STREAMS_URL}/bots/${SECOND_BOT_ID}/gateway`,
				])
			}).pipe(
				Effect.provide(makeServiceLayer([BOT_ID, SECOND_BOT_ID])),
				Effect.ensuring(
					Effect.sync(() => {
						globalThis.fetch = originalFetch
					}),
				),
			),
		)
	})
})
