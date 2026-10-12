import { ChannelId, ChannelWebhookId, OrganizationId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, timestamptz, uuid, varchar } from "./columns"

export const channelWebhooksTable = PG.table("channel_webhooks", {
	columns: {
		id: PG.column(uuid(ChannelWebhookId), { defaultExpr: "gen_random_uuid()" }),
		channelId: uuid(ChannelId),
		organizationId: uuid(OrganizationId),
		botUserId: uuid(UserId),
		name: varchar(100),
		description: PG.nullable(PG.text),
		avatarUrl: PG.nullable(PG.text),
		tokenHash: PG.text,
		tokenSuffix: varchar(4),
		isEnabled: PG.column(PG.bool, { default: true }),
		createdBy: uuid(UserId),
		lastUsedAt: PG.nullable(timestamptz),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("channel_webhooks_channel_id_idx", ["channelId"]),
		PG.index("channel_webhooks_organization_id_idx", ["organizationId"]),
		PG.index("channel_webhooks_bot_user_id_idx", ["botUserId"]),
		PG.index("channel_webhooks_token_hash_idx", ["tokenHash"]),
		PG.index("channel_webhooks_deleted_at_idx", ["deletedAt"]),
	],
})
export type ChannelWebhook = PG.SelectRowOf<typeof channelWebhooksTable>
export type NewChannelWebhook = PG.InsertRowOf<typeof channelWebhooksTable>
