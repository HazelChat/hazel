import { ChannelSectionId, OrganizationId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, timestamptz, uuid, varchar } from "./columns"

export const channelSectionsTable = PG.table("channel_sections", {
	columns: {
		id: PG.column(uuid(ChannelSectionId), { defaultExpr: "gen_random_uuid()" }),
		organizationId: uuid(OrganizationId),
		name: varchar(255),
		order: PG.column(PG.int4, { default: 0 }),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("channel_sections_organization_id_idx", ["organizationId"]),
		PG.index("channel_sections_order_idx", ["organizationId", "order"]),
		PG.index("channel_sections_deleted_at_idx", ["deletedAt"]),
	],
})
export type ChannelSection = PG.SelectRowOf<typeof channelSectionsTable>
export type NewChannelSection = PG.InsertRowOf<typeof channelSectionsTable>
