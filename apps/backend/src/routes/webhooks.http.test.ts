import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import {
	compareSequinWebhookEventsByCommitOrder,
	sortSequinWebhookEventsByCommitOrder,
	processSequinWebhookEventsInCommitOrder,
	syncSequinWebhookEventToDiscord,
} from "./webhooks.http.ts"
import type { SequinWebhookEvent } from "@hazel/domain/http"

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
	updatedAt: null,
})

const makeEvent = (
	record: { id: string },
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
})
