import type { ChannelId, MessageId, OrganizationId, RssSubscriptionId, UserId } from "@hazel/schema"
import { sql } from "drizzle-orm"
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core"

export const rssSubscriptionsTable = pgTable(
	"rss_subscriptions",
	{
		id: uuid().primaryKey().defaultRandom().$type<RssSubscriptionId>(),
		channelId: uuid().notNull().$type<ChannelId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		feedUrl: text().notNull(),
		feedTitle: varchar({ length: 255 }),
		feedIconUrl: text(),
		lastFetchedAt: timestamp({ mode: "date", withTimezone: true }),
		lastItemPublishedAt: timestamp({ mode: "date", withTimezone: true }),
		lastItemGuid: text(),
		consecutiveErrors: integer().notNull().default(0),
		lastErrorMessage: text(),
		lastErrorAt: timestamp({ mode: "date", withTimezone: true }),
		isEnabled: boolean().notNull().default(true),
		pollingIntervalMinutes: integer().notNull().default(15),
		createdBy: uuid().notNull().$type<UserId>(),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("rss_subscriptions_channel_id_idx").on(table.channelId),
		index("rss_subscriptions_organization_id_idx").on(table.organizationId),
		index("rss_subscriptions_deleted_at_idx").on(table.deletedAt),
		index("rss_subscriptions_poll_idx").on(table.isEnabled, table.lastFetchedAt, table.deletedAt),
		// Unique constraint: one subscription per channel-feed pair (excluding soft-deleted)
		uniqueIndex("rss_subscriptions_channel_feed_unique")
			.on(table.channelId, table.feedUrl)
			.where(sql`${table.deletedAt} IS NULL`),
	],
)

export const rssPostedItemsTable = pgTable(
	"rss_posted_items",
	{
		id: uuid().primaryKey().defaultRandom(),
		subscriptionId: uuid()
			.notNull()
			.$type<RssSubscriptionId>(),
		itemGuid: text().notNull(),
		itemUrl: text(),
		messageId: uuid().$type<MessageId>(),
		postedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("rss_posted_items_subscription_id_idx").on(table.subscriptionId),
		uniqueIndex("rss_posted_items_sub_guid_unique").on(table.subscriptionId, table.itemGuid),
	],
)

// Type exports
export type RssSubscription = typeof rssSubscriptionsTable.$inferSelect
export type NewRssSubscription = typeof rssSubscriptionsTable.$inferInsert
export type RssPostedItem = typeof rssPostedItemsTable.$inferSelect
export type NewRssPostedItem = typeof rssPostedItemsTable.$inferInsert
