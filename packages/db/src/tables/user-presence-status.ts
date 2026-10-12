import { ChannelId, UserId, UserPresenceStatusId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { pgEnum, timestamptz, varchar } from "./columns"

export const userPresenceStatusEnum = pgEnum("user_presence_status_enum", [
	"online",
	"away",
	"busy",
	"dnd",
	"offline",
])

export const userPresenceStatusTable = PG.table("user_presence_status", {
	columns: {
		id: PG.column(PG.brand(PG.uuid, UserPresenceStatusId), { defaultExpr: "gen_random_uuid()" }),
		userId: PG.brand(PG.uuid, UserId),
		status: PG.column(userPresenceStatusEnum, { default: "online" }),
		customMessage: PG.nullable(varchar(255)),
		statusEmoji: PG.nullable(varchar(10)),
		statusExpiresAt: PG.nullable(timestamptz),
		activeChannelId: PG.nullable(PG.brand(PG.uuid, ChannelId)),
		suppressNotifications: PG.column(PG.bool, { default: false }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		lastSeenAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: ["id"],
	indexes: [
		PG.uniqueIndex("user_presence_status_userId_unique", ["userId"]),
		PG.index("user_presence_status_user_id_idx", ["userId"]),
		PG.index("user_presence_status_active_channel_idx", ["activeChannelId"]),
		PG.index("user_presence_status_last_seen_idx", ["lastSeenAt"]),
	],
})
export type UserPresenceStatus = PG.SelectRowOf<typeof userPresenceStatusTable>
export type NewUserPresenceStatus = PG.InsertRowOf<typeof userPresenceStatusTable>
