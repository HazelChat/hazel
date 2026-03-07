import type { ChannelId, MessageOutboxEventId } from "@hazel/schema"
import { sql } from "drizzle-orm"
import {
	bigint,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core"

export const messageOutboxEventTypeEnum = pgEnum("message_outbox_event_type", [
	"message_created",
	"message_updated",
	"message_deleted",
	"reaction_created",
	"reaction_deleted",
])

export const messageOutboxEventStatusEnum = pgEnum("message_outbox_event_status", [
	"pending",
	"processing",
	"processed",
	"failed",
])

export const messageOutboxEventsTable = pgTable(
	"message_outbox_events",
	{
		id: uuid().primaryKey().defaultRandom().$type<MessageOutboxEventId>(),
		sequence: bigint({ mode: "number" }).generatedAlwaysAsIdentity().notNull(),
		eventType: messageOutboxEventTypeEnum().notNull(),
		aggregateId: uuid().notNull(),
		channelId: uuid().notNull().$type<ChannelId>(),
		payload: jsonb().$type<Record<string, unknown>>().notNull(),
		status: messageOutboxEventStatusEnum().notNull().default("pending"),
		attemptCount: integer().notNull().default(0),
		availableAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		lockedAt: timestamp({ mode: "date", withTimezone: true }),
		lockedBy: varchar({ length: 255 }),
		lastError: text(),
		processedAt: timestamp({ mode: "date", withTimezone: true }),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("message_outbox_events_sequence_unique").on(table.sequence),
		index("message_outbox_events_status_available_sequence_idx").on(
			table.status,
			table.availableAt,
			table.sequence,
		),
		index("message_outbox_events_channel_sequence_idx").on(table.channelId, table.sequence),
		index("message_outbox_events_created_at_idx").on(table.createdAt),
		index("message_outbox_events_locked_at_idx")
			.on(table.lockedAt)
			.where(sql`${table.status} = 'processing'`),
	],
)

export type MessageOutboxEvent = typeof messageOutboxEventsTable.$inferSelect
export type NewMessageOutboxEvent = typeof messageOutboxEventsTable.$inferInsert
