import { ChannelId, OrganizationId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, timestamptz, uuid } from "./columns"

export const channelAccessTable = PG.table("channel_access", {
	columns: {
		userId: uuid(UserId),
		channelId: uuid(ChannelId),
		organizationId: uuid(OrganizationId),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: { columns: ["userId", "channelId"], name: "channel_access_user_channel_pk" },
	indexes: [
		PG.index("channel_access_user_id_idx", ["userId"]),
		PG.index("channel_access_channel_id_idx", ["channelId"]),
		PG.index("channel_access_organization_id_idx", ["organizationId"]),
		PG.index("channel_access_org_user_idx", ["organizationId", "userId"]),
	],
})
export type ChannelAccess = PG.SelectRowOf<typeof channelAccessTable>
export type NewChannelAccess = PG.InsertRowOf<typeof channelAccessTable>
