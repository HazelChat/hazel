import { ChannelId, MessageId, OrganizationId, RssSubscriptionId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { timestamptz, varchar } from "./columns"

export const rssPostedItemsTable = PG.table("rss_posted_items", {
	columns: {
		id: PG.column(PG.uuid, { defaultExpr: "gen_random_uuid()" }),
		subscriptionId: PG.brand(PG.uuid, RssSubscriptionId),
		itemGuid: PG.text,
		itemUrl: PG.nullable(PG.text),
		messageId: PG.nullable(PG.brand(PG.uuid, MessageId)),
		postedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("rss_posted_items_subscription_id_idx", ["subscriptionId"]),
		PG.uniqueIndex("rss_posted_items_sub_guid_unique", ["subscriptionId", "itemGuid"]),
	],
})
export type RssPostedItem = PG.SelectRowOf<typeof rssPostedItemsTable>
export type NewRssPostedItem = PG.InsertRowOf<typeof rssPostedItemsTable>

export const rssSubscriptionsTable = PG.table("rss_subscriptions", {
	columns: {
		id: PG.column(PG.brand(PG.uuid, RssSubscriptionId), { defaultExpr: "gen_random_uuid()" }),
		channelId: PG.brand(PG.uuid, ChannelId),
		organizationId: PG.brand(PG.uuid, OrganizationId),
		feedUrl: PG.text,
		feedTitle: PG.nullable(varchar(255)),
		feedIconUrl: PG.nullable(PG.text),
		lastFetchedAt: PG.nullable(timestamptz),
		lastItemPublishedAt: PG.nullable(timestamptz),
		lastItemGuid: PG.nullable(PG.text),
		consecutiveErrors: PG.column(PG.int4, { default: 0 }),
		lastErrorMessage: PG.nullable(PG.text),
		lastErrorAt: PG.nullable(timestamptz),
		isEnabled: PG.column(PG.bool, { default: true }),
		pollingIntervalMinutes: PG.column(PG.int4, { default: 15 }),
		createdBy: PG.brand(PG.uuid, UserId),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("rss_subscriptions_channel_id_idx", ["channelId"]),
		PG.index("rss_subscriptions_organization_id_idx", ["organizationId"]),
		PG.index("rss_subscriptions_deleted_at_idx", ["deletedAt"]),
		PG.index("rss_subscriptions_poll_idx", ["isEnabled", "lastFetchedAt", "deletedAt"]),
		PG.uniqueIndex("rss_subscriptions_channel_feed_unique", ["channelId", "feedUrl"], {
			where: '"deletedAt" IS NULL',
		}),
	],
})
export type RssSubscription = PG.SelectRowOf<typeof rssSubscriptionsTable>
export type NewRssSubscription = PG.InsertRowOf<typeof rssSubscriptionsTable>
