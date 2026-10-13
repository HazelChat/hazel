import { ChannelId, MessageOutboxEventId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { jsonb, now, timestamptz, uuid, varchar } from "./columns"

export const messageOutboxEventTypeEnum = PG.enumType("message_outbox_event_type", [
	"message_created",
	"message_updated",
	"message_deleted",
	"reaction_created",
	"reaction_deleted",
])
export const messageOutboxEventStatusEnum = PG.enumType("message_outbox_event_status", [
	"pending",
	"processing",
	"processed",
	"failed",
])

export const messageOutboxEventsTable = PG.table("message_outbox_events", {
	columns: {
		id: PG.column(uuid(MessageOutboxEventId), { defaultExpr: "gen_random_uuid()" }),
		sequence: PG.column(PG.int8, { identity: "always" }),
		eventType: messageOutboxEventTypeEnum,
		aggregateId: PG.uuid,
		channelId: uuid(ChannelId),
		payload: jsonb<Record<string, unknown>>(),
		status: PG.column(messageOutboxEventStatusEnum, { default: "pending" }),
		attemptCount: PG.column(PG.int4, { default: 0 }),
		availableAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		lockedAt: PG.nullable(timestamptz),
		lockedBy: PG.nullable(varchar(255)),
		lastError: PG.nullable(PG.text),
		processedAt: PG.nullable(timestamptz),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: ["id"],
	indexes: [
		PG.uniqueIndex("message_outbox_events_sequence_unique", ["sequence"]),
		PG.index("message_outbox_events_status_available_sequence_idx", [
			"status",
			"availableAt",
			"sequence",
		]),
		PG.index("message_outbox_events_channel_sequence_idx", ["channelId", "sequence"]),
		PG.index("message_outbox_events_created_at_idx", ["createdAt"]),
		PG.index("message_outbox_events_locked_at_idx", ["lockedAt"], { where: "\"status\" = 'processing'" }),
	],
})
export type MessageOutboxEvent = PG.SelectRowOf<typeof messageOutboxEventsTable>
export type NewMessageOutboxEvent = PG.InsertRowOf<typeof messageOutboxEventsTable>
