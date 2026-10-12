import { BotId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { jsonb, now, timestamptz, uuid, varchar } from "./columns"
import type { IntegrationConnection } from "./integration-connections"

type IntegrationProvider = IntegrationConnection["provider"]

export const botsTable = PG.table("bots", {
	columns: {
		id: PG.column(uuid(BotId), { defaultExpr: "gen_random_uuid()" }),
		userId: uuid(UserId),
		createdBy: uuid(UserId),
		name: varchar(100),
		description: PG.nullable(PG.text),
		webhookUrl: PG.nullable(PG.text),
		apiTokenHash: PG.text,
		scopes: PG.nullable(jsonb<string[]>()),
		metadata: PG.nullable(jsonb<Record<string, any>>()),
		isPublic: PG.column(PG.bool, { default: false }),
		installCount: PG.column(PG.int4, { default: 0 }),
		mentionable: PG.column(PG.bool, { default: false }),
		allowedIntegrations: PG.column(PG.nullable(jsonb<IntegrationProvider[]>()), { default: [] }),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.uniqueIndex("bots_userId_unique", ["userId"]),
		PG.index("bots_user_id_idx", ["userId"]),
		PG.index("bots_created_by_idx", ["createdBy"]),
		PG.index("bots_is_public_idx", ["isPublic"]),
		PG.index("bots_deleted_at_idx", ["deletedAt"]),
	],
})
export type Bot = PG.SelectRowOf<typeof botsTable>
export type NewBot = PG.InsertRowOf<typeof botsTable>
