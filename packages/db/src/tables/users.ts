import { UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { jsonb, pgEnum, timestamptz, varchar } from "./columns"

export const userTypeEnum = pgEnum("user_type", ["user", "machine"])

export const usersTable = PG.table("users", {
	columns: {
		id: PG.column(PG.brand(PG.uuid, UserId), { defaultExpr: "gen_random_uuid()" }),
		externalId: varchar(255),
		email: varchar(255),
		firstName: varchar(100),
		lastName: varchar(100),
		avatarUrl: PG.nullable(PG.text),
		userType: PG.column(userTypeEnum, { default: "user" }),
		settings: PG.nullable(jsonb<Record<string, any>>()),
		isOnboarded: PG.column(PG.bool, { default: false }),
		timezone: PG.nullable(varchar(100)),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.uniqueIndex("users_externalId_unique", ["externalId"]),
		PG.index("users_external_id_idx", ["externalId"]),
		PG.index("users_email_idx", ["email"]),
		PG.index("users_user_type_idx", ["userType"]),
		PG.index("users_deleted_at_idx", ["deletedAt"]),
	],
})
export type User = PG.SelectRowOf<typeof usersTable>
export type NewUser = PG.InsertRowOf<typeof usersTable>
