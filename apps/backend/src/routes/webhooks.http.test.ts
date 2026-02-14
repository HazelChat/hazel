import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import {
	compareSequinWebhookEventsByCommitOrder,
	sortSequinWebhookEventsByCommitOrder,
	processSequinWebhookEventsInCommitOrder,
	syncSequinWebhookEventToDiscord,
} from "./webhooks.http.ts"
import { SequinWebhookPayload, type SequinWebhookEvent } from "@hazel/domain/http"
import { recordChatSyncDiagnostic } from "../test/chat-sync-test-diagnostics"

const metadataDefaults = {
	idempotency_key: "idempotency-default",
	record_pks: [],
	table_name: "messages",
	table_schema: "public",
	database_name: "test-db",
	transaction_annotations: null,
	enrichment: null,
	consumer: {
		id: "consumer",
		name: "consumer",
		annotations: {},
	},
	database: {
		id: "database",
		name: "test-db",
		hostname: "localhost",
		database: "test-db",
		annotations: {},
	},
}

const makeMessageRecord = (id: string, deletedAt: string | null = null) => ({
	id,
	channelId: "channel-1",
	authorId: "author-1",
	content: `message ${id}`,
	replyToMessageId: null,
	threadChannelId: null,
	createdAt: "2026-02-01T00:00:00.000Z",
	updatedAt: null,
	deletedAt,
})

const makeReactionRecord = (id: string) => ({
	id,
	messageId: "message-1",
	channelId: "channel-1",
	userId: "user-1",
	emoji: "🔥",
	createdAt: "2026-02-01T00:00:00.000Z",
})

const makeEvent = (
	record: { id: string } & Record<string, unknown>,
	table: "messages" | "message_reactions",
	metadata: {
		action?: "insert" | "update" | "delete"
		commit_timestamp: string
		commit_lsn: number
		commit_idx: number
	},
): SequinWebhookEvent => {
	return {
		record,
		metadata: {
			...metadataDefaults,
			table_name: table,
			...metadata,
			action: metadata.action,
		},
		action: metadata.action ?? "insert",
		changes: null,
	} as unknown as SequinWebhookEvent
}

const makeWorkerSpy = () => {
	const calls: Array<{
		method: string
		id: string
		dedupeKey?: string
	}> = []

	const worker: Parameters<typeof syncSequinWebhookEventToDiscord>[2] = {
		syncHazelMessageCreateToAllConnections: (messageId: string, dedupeKey?: string) =>
			Effect.sync(() => {
				calls.push({ method: "syncHazelMessageCreateToAllConnections", id: messageId, dedupeKey })
				return { synced: 1, failed: 0 }
			}),
		syncHazelMessageUpdateToAllConnections: (messageId: string, dedupeKey?: string) =>
			Effect.sync(() => {
				calls.push({ method: "syncHazelMessageUpdateToAllConnections", id: messageId, dedupeKey })
				return { synced: 1, failed: 0 }
			}),
		syncHazelMessageDeleteToAllConnections: (messageId: string, dedupeKey?: string) =>
			Effect.sync(() => {
				calls.push({ method: "syncHazelMessageDeleteToAllConnections", id: messageId, dedupeKey })
				return { synced: 1, failed: 0 }
			}),
		syncHazelReactionCreateToAllConnections: (reactionId: string, dedupeKey?: string) =>
			Effect.sync(() => {
				calls.push({ method: "syncHazelReactionCreateToAllConnections", id: reactionId, dedupeKey })
				return { synced: 1, failed: 0 }
			}),
		syncHazelReactionDeleteToAllConnections: (
			payload: { hazelMessageId: string },
			dedupeKey?: string,
		) =>
			Effect.sync(() => {
				calls.push({
					method: "syncHazelReactionDeleteToAllConnections",
					id: payload.hazelMessageId,
					dedupeKey,
				})
				return { synced: 1, failed: 0 }
			}),
	}

	return {
		worker,
		calls,
	}
}

describe("sequin webhook payload decoding", () => {
	it("accepts message_reactions payloads without updatedAt", () => {
		Schema.decodeUnknownSync(SequinWebhookPayload)({
			data: [
				{
					record: {
						id: "00000000-0000-0000-0000-000000000111",
						messageId: "00000000-0000-0000-0000-000000000112",
						channelId: "00000000-0000-0000-0000-000000000113",
						userId: "00000000-0000-0000-0000-000000000114",
						emoji: "🔥",
						createdAt: "2026-02-13T00:48:12.792694Z",
					},
					metadata: {
						...metadataDefaults,
						idempotency_key: "Njk3MDI2NzYzNTkyOjA=",
						commit_lsn: 697026763592,
						commit_idx: 0,
						record_pks: ["00000000-0000-0000-0000-000000000111"],
						table_name: "message_reactions",
						commit_timestamp: "2026-02-13T00:48:12.817130Z",
					},
					action: "insert",
					changes: null,
				},
			],
		})
	})
})

describe("sequin webhook sorting", () => {
	it("sorts events by commit timestamp, commit LSN, and commit idx", () => {
		const events: SequinWebhookEvent[] = [
			makeEvent(makeMessageRecord("msg-b"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T10:00:00.000Z",
				commit_lsn: 20,
				commit_idx: 0,
			}),
			makeEvent(makeMessageRecord("msg-a"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T10:00:00.000Z",
				commit_lsn: 10,
				commit_idx: 0,
			}),
			makeEvent(makeMessageRecord("msg-c"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T09:59:59.000Z",
				commit_lsn: 99,
				commit_idx: 0,
			}),
			makeEvent(makeMessageRecord("msg-d"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T10:00:00.000Z",
				commit_lsn: 10,
				commit_idx: 1,
			}),
		]

		const sorted = sortSequinWebhookEventsByCommitOrder(events)

		expect(sorted.map((event) => event.record.id)).toEqual([
			"msg-c",
			"msg-a",
			"msg-d",
			"msg-b",
		])
	})

	it("falls back to deterministic record id when commit metadata is equal", () => {
		const events: SequinWebhookEvent[] = [
			makeEvent(makeMessageRecord("msg-z"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T11:00:00.000Z",
				commit_lsn: 1,
				commit_idx: 1,
			}),
			makeEvent(makeMessageRecord("msg-a"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T11:00:00.000Z",
				commit_lsn: 1,
				commit_idx: 1,
			}),
		]

		expect(
			sortSequinWebhookEventsByCommitOrder(events).map((event) => event.record.id),
		).toEqual(["msg-a", "msg-z"])
		expect(
			compareSequinWebhookEventsByCommitOrder(events[0], events[1]),
		).toBeGreaterThan(0)
	})
})

describe("sequin webhook processing order", () => {
	it("processes mixed message and reaction events in commit order", async () => {
		const workerCalls: string[] = []
		const worker: Parameters<typeof syncSequinWebhookEventToDiscord>[2] = {
			syncHazelMessageCreateToAllConnections: (messageId: string) =>
				Effect.sync(() => {
					workerCalls.push(`create:${messageId}`)
					return { synced: 1, failed: 0 }
				}),
			syncHazelMessageUpdateToAllConnections: (messageId: string) =>
				Effect.sync(() => {
					workerCalls.push(`update:${messageId}`)
					return { synced: 1, failed: 0 }
				}),
			syncHazelMessageDeleteToAllConnections: (messageId: string) =>
				Effect.sync(() => {
					workerCalls.push(`delete:${messageId}`)
					return { synced: 1, failed: 0 }
				}),
			syncHazelReactionCreateToAllConnections: (reactionId: string) =>
				Effect.sync(() => {
					workerCalls.push(`reaction-create:${reactionId}`)
					return { synced: 1, failed: 0 }
				}),
			syncHazelReactionDeleteToAllConnections: (payload: { hazelMessageId: string }) =>
				Effect.sync(() => {
					workerCalls.push(`reaction-delete:${payload.hazelMessageId}`)
					return { synced: 1, failed: 0 }
				}),
		}

		const events: SequinWebhookEvent[] = [
			makeEvent(makeMessageRecord("msg-b"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T10:00:00.000Z",
				commit_lsn: 5,
				commit_idx: 0,
			}),
			makeEvent(makeReactionRecord("reaction-1"), "message_reactions", {
				action: "insert",
				commit_timestamp: "2026-02-01T09:59:00.000Z",
				commit_lsn: 3,
				commit_idx: 0,
			}),
			makeEvent(makeMessageRecord("msg-a"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T10:00:00.000Z",
				commit_lsn: 4,
				commit_idx: 0,
			}),
		]

		await Effect.runPromise(
			processSequinWebhookEventsInCommitOrder(events, (event) =>
				syncSequinWebhookEventToDiscord(event, "integration-bot", worker),
			),
		)
		expect(workerCalls).toEqual([
			"reaction-create:reaction-1",
			"create:msg-a",
			"create:msg-b",
		])
	})

	it("continues processing when a worker sync fails while keeping order", async () => {
		const workerCalls: string[] = []
		const worker: Parameters<typeof syncSequinWebhookEventToDiscord>[2] = {
			syncHazelMessageCreateToAllConnections: (messageId: string) => {
				if (messageId === "msg-bad") {
					return Effect.fail(new Error("boom"))
				}
				return Effect.sync(() => {
					workerCalls.push(`create:${messageId}`)
					return { synced: 1, failed: 0 }
				})
			},
			syncHazelMessageUpdateToAllConnections: () => Effect.succeed({ synced: 1, failed: 0 }),
			syncHazelMessageDeleteToAllConnections: () => Effect.succeed({ synced: 1, failed: 0 }),
			syncHazelReactionCreateToAllConnections: () => Effect.succeed({ synced: 1, failed: 0 }),
			syncHazelReactionDeleteToAllConnections: () => Effect.succeed({ synced: 1, failed: 0 }),
		}

		const events: SequinWebhookEvent[] = [
			makeEvent(makeMessageRecord("msg-bad"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T11:00:00.000Z",
				commit_lsn: 2,
				commit_idx: 0,
			}),
			makeEvent(makeMessageRecord("msg-good"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T11:00:01.000Z",
				commit_lsn: 2,
				commit_idx: 0,
			}),
		]

		await Effect.runPromise(
			processSequinWebhookEventsInCommitOrder(events, (event) =>
				syncSequinWebhookEventToDiscord(event, "integration-bot", worker),
			),
		)

		expect(workerCalls).toEqual(["create:msg-good"])
	})

	it("still routes message insert events that may include attachment-backed messages", async () => {
		const workerCalls: string[] = []
		const worker: Parameters<typeof syncSequinWebhookEventToDiscord>[2] = {
			syncHazelMessageCreateToAllConnections: (messageId: string) =>
				Effect.sync(() => {
					workerCalls.push(`create:${messageId}`)
					return { synced: 1, failed: 0 }
				}),
			syncHazelMessageUpdateToAllConnections: () => Effect.succeed({ synced: 1, failed: 0 }),
			syncHazelMessageDeleteToAllConnections: () => Effect.succeed({ synced: 1, failed: 0 }),
			syncHazelReactionCreateToAllConnections: () => Effect.succeed({ synced: 1, failed: 0 }),
			syncHazelReactionDeleteToAllConnections: () => Effect.succeed({ synced: 1, failed: 0 }),
		}

		const attachmentBackedEvent = makeEvent(
			{
				...makeMessageRecord("msg-attachment-backed"),
				content: "",
			},
			"messages",
			{
				action: "insert",
				commit_timestamp: "2026-02-01T12:00:00.000Z",
				commit_lsn: 3,
				commit_idx: 0,
			},
		)

		await Effect.runPromise(
			syncSequinWebhookEventToDiscord(attachmentBackedEvent, "integration-bot", worker),
		)

		expect(workerCalls).toEqual(["create:msg-attachment-backed"])
	})
})

describe("sequin webhook sync routing matrix", () => {
	it("routes message insert/update/delete and soft-delete update to expected worker methods", async () => {
		const { worker, calls } = makeWorkerSpy()
		const messageId = "msg-route-1"

		const insertEvent = makeEvent(makeMessageRecord(messageId), "messages", {
			action: "insert",
			commit_timestamp: "2026-02-01T12:00:00.000Z",
			commit_lsn: 10,
			commit_idx: 0,
		})
		const updateEvent = makeEvent(
			{
				...makeMessageRecord(messageId),
				content: "updated",
			},
			"messages",
			{
				action: "update",
				commit_timestamp: "2026-02-01T12:00:01.000Z",
				commit_lsn: 10,
				commit_idx: 1,
			},
		)
		const deleteEvent = makeEvent(makeMessageRecord(messageId), "messages", {
			action: "delete",
			commit_timestamp: "2026-02-01T12:00:02.000Z",
			commit_lsn: 10,
			commit_idx: 2,
		})
		const softDeleteUpdateEvent = makeEvent(
			makeMessageRecord(messageId, "2026-02-01T12:00:03.000Z"),
			"messages",
			{
				action: "update",
				commit_timestamp: "2026-02-01T12:00:03.000Z",
				commit_lsn: 10,
				commit_idx: 3,
			},
		)

		await Effect.runPromise(
			syncSequinWebhookEventToDiscord(insertEvent, "integration-bot", worker),
		)
		await Effect.runPromise(
			syncSequinWebhookEventToDiscord(updateEvent, "integration-bot", worker),
		)
		await Effect.runPromise(
			syncSequinWebhookEventToDiscord(deleteEvent, "integration-bot", worker),
		)
		await Effect.runPromise(
			syncSequinWebhookEventToDiscord(softDeleteUpdateEvent, "integration-bot", worker),
		)

		recordChatSyncDiagnostic({
			suite: "webhooks.http",
			testCase: "message-routing-matrix",
			workerMethod: calls[0]?.method ?? "unknown",
			action: "route",
			dedupeKey: calls[0]?.dedupeKey,
			expected: "create/update/delete/delete",
			actual: calls.map((call) => call.method).join("/"),
			metadata: {
				messageId,
			},
		})

		expect(calls.map((call) => call.method)).toEqual([
			"syncHazelMessageCreateToAllConnections",
			"syncHazelMessageUpdateToAllConnections",
			"syncHazelMessageDeleteToAllConnections",
			"syncHazelMessageDeleteToAllConnections",
		])
		expect(calls.every((call) => call.dedupeKey?.includes("hazel:sequin:messages"))).toBe(true)
	})

	it("routes reaction insert/delete and ignores reaction update action", async () => {
		const { worker, calls } = makeWorkerSpy()

		const insertEvent = makeEvent(makeReactionRecord("react-route-1"), "message_reactions", {
			action: "insert",
			commit_timestamp: "2026-02-01T12:10:00.000Z",
			commit_lsn: 20,
			commit_idx: 0,
		})
		const deleteEvent = makeEvent(makeReactionRecord("react-route-2"), "message_reactions", {
			action: "delete",
			commit_timestamp: "2026-02-01T12:10:01.000Z",
			commit_lsn: 20,
			commit_idx: 1,
		})
		const updateEvent = makeEvent(makeReactionRecord("react-route-3"), "message_reactions", {
			action: "update",
			commit_timestamp: "2026-02-01T12:10:02.000Z",
			commit_lsn: 20,
			commit_idx: 2,
		})

		await Effect.runPromise(
			syncSequinWebhookEventToDiscord(insertEvent, "integration-bot", worker),
		)
		await Effect.runPromise(
			syncSequinWebhookEventToDiscord(deleteEvent, "integration-bot", worker),
		)
		await Effect.runPromise(
			syncSequinWebhookEventToDiscord(updateEvent, "integration-bot", worker),
		)

		expect(calls.map((call) => call.method)).toEqual([
			"syncHazelReactionCreateToAllConnections",
			"syncHazelReactionDeleteToAllConnections",
		])
		expect(calls.every((call) => call.dedupeKey?.includes("hazel:sequin:message_reactions"))).toBe(
			true,
		)
	})

	it("filters integration bot authored message/reaction events to prevent loops", async () => {
		const { worker, calls } = makeWorkerSpy()
		const integrationBotUserId = "integration-bot"

		await Effect.runPromise(
			syncSequinWebhookEventToDiscord(
				makeEvent(
					{
						...makeMessageRecord("msg-loop"),
						authorId: integrationBotUserId,
					},
					"messages",
					{
						action: "insert",
						commit_timestamp: "2026-02-01T12:20:00.000Z",
						commit_lsn: 30,
						commit_idx: 0,
					},
				),
				integrationBotUserId,
				worker,
			),
		)
		await Effect.runPromise(
			syncSequinWebhookEventToDiscord(
				makeEvent(
					{
						...makeReactionRecord("reaction-loop"),
						userId: integrationBotUserId,
					},
					"message_reactions",
					{
						action: "insert",
						commit_timestamp: "2026-02-01T12:20:01.000Z",
						commit_lsn: 30,
						commit_idx: 1,
					},
				),
				integrationBotUserId,
				worker,
			),
		)

		expect(calls).toHaveLength(0)
	})

	it("isolates per-event failures across message and reaction action types", async () => {
		const workerCalls: string[] = []
		const failingWorker: Parameters<typeof syncSequinWebhookEventToDiscord>[2] = {
			syncHazelMessageCreateToAllConnections: () => Effect.fail(new Error("create failed")),
			syncHazelMessageUpdateToAllConnections: (messageId: string) =>
				Effect.sync(() => {
					workerCalls.push(`update:${messageId}`)
					return { synced: 1, failed: 0 }
				}),
			syncHazelMessageDeleteToAllConnections: () => Effect.fail(new Error("delete failed")),
			syncHazelReactionCreateToAllConnections: () => Effect.fail(new Error("reaction create failed")),
			syncHazelReactionDeleteToAllConnections: (payload: { hazelMessageId: string }) =>
				Effect.sync(() => {
					workerCalls.push(`reaction-delete:${payload.hazelMessageId}`)
					return { synced: 1, failed: 0 }
				}),
		}

		const events: SequinWebhookEvent[] = [
			makeEvent(makeMessageRecord("msg-fail-create"), "messages", {
				action: "insert",
				commit_timestamp: "2026-02-01T13:00:00.000Z",
				commit_lsn: 40,
				commit_idx: 0,
			}),
			makeEvent(makeMessageRecord("msg-ok-update"), "messages", {
				action: "update",
				commit_timestamp: "2026-02-01T13:00:01.000Z",
				commit_lsn: 40,
				commit_idx: 1,
			}),
			makeEvent(makeMessageRecord("msg-fail-delete"), "messages", {
				action: "delete",
				commit_timestamp: "2026-02-01T13:00:02.000Z",
				commit_lsn: 40,
				commit_idx: 2,
			}),
			makeEvent(makeReactionRecord("reaction-fail-create"), "message_reactions", {
				action: "insert",
				commit_timestamp: "2026-02-01T13:00:03.000Z",
				commit_lsn: 40,
				commit_idx: 3,
			}),
			makeEvent(makeReactionRecord("reaction-ok-delete"), "message_reactions", {
				action: "delete",
				commit_timestamp: "2026-02-01T13:00:04.000Z",
				commit_lsn: 40,
				commit_idx: 4,
			}),
		]

		await Effect.runPromise(
			processSequinWebhookEventsInCommitOrder(events, (event) =>
				syncSequinWebhookEventToDiscord(event, "integration-bot", failingWorker),
			),
		)

		recordChatSyncDiagnostic({
			suite: "webhooks.http",
			testCase: "failure-isolation",
			workerMethod: "processSequinWebhookEventsInCommitOrder",
			action: "continue_on_error",
			expected: "update:msg-ok-update,reaction-delete:message-1",
			actual: workerCalls.join(","),
		})

		expect(workerCalls).toEqual(["update:msg-ok-update", "reaction-delete:message-1"])
	})
})
