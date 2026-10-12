import { CustomEmojiId, OrganizationId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, timestamptz, uuid, varchar } from "./columns"

export const customEmojisTable = PG.table("custom_emojis", {
	columns: {
		id: PG.column(uuid(CustomEmojiId), { defaultExpr: "gen_random_uuid()" }),
		organizationId: uuid(OrganizationId),
		name: varchar(64),
		imageUrl: PG.text,
		createdBy: uuid(UserId),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.nullable(timestamptz),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("custom_emojis_organization_id_idx", ["organizationId"]),
		PG.index("custom_emojis_name_idx", ["name"]),
		PG.uniqueIndex("custom_emojis_org_name_unique_idx", ["organizationId", "name"], {
			where: '"deletedAt" IS NULL',
		}),
		PG.index("custom_emojis_deleted_at_idx", ["deletedAt"]),
	],
})
export type CustomEmoji = PG.SelectRowOf<typeof customEmojisTable>
export type NewCustomEmoji = PG.InsertRowOf<typeof customEmojisTable>
