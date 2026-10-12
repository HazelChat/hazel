import { NotificationId, OrganizationMemberId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, timestamptz, uuid, varchar } from "./columns"

export const notificationsTable = PG.table("notifications", {
	columns: {
		id: PG.column(uuid(NotificationId), { defaultExpr: "gen_random_uuid()" }),
		memberId: uuid(OrganizationMemberId),
		targetedResourceId: PG.nullable(PG.uuid),
		targetedResourceType: PG.nullable(varchar(50)),
		resourceId: PG.nullable(PG.uuid),
		resourceType: PG.nullable(varchar(50)),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		readAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("notifications_member_id_idx", ["memberId"]),
		PG.index("notifications_member_created_id_idx", ["memberId", "createdAt", "id"]),
		PG.index("notifications_targeted_resource_idx", ["targetedResourceId", "targetedResourceType"]),
		PG.index("notifications_resource_idx", ["resourceId", "resourceType"]),
		PG.index("notifications_read_at_idx", ["readAt"]),
		PG.uniqueIndex(
			"notifications_message_channel_dedupe_idx",
			["memberId", "resourceId", "targetedResourceId"],
			{ where: "\"resourceType\" = 'message' AND \"targetedResourceType\" = 'channel'" },
		),
	],
})
export type Notification = PG.SelectRowOf<typeof notificationsTable>
export type NewNotification = PG.InsertRowOf<typeof notificationsTable>
