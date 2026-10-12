import { BotId, BotInstallationId, OrganizationId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, timestamptz, uuid } from "./columns"

export const botInstallationsTable = PG.table("bot_installations", {
	columns: {
		id: PG.column(uuid(BotInstallationId), { defaultExpr: "gen_random_uuid()" }),
		botId: uuid(BotId),
		organizationId: uuid(OrganizationId),
		installedBy: uuid(UserId),
		installedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("bot_installations_org_idx", ["organizationId"]),
		PG.index("bot_installations_bot_idx", ["botId"]),
		PG.uniqueIndex("bot_installations_bot_org_unique", ["botId", "organizationId"]),
	],
})
export type BotInstallation = PG.SelectRowOf<typeof botInstallationsTable>
export type NewBotInstallation = PG.InsertRowOf<typeof botInstallationsTable>
