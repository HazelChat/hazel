import { IntegrationConnectionId, IntegrationTokenId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, timestamptz, uuid, varchar } from "./columns"

export const integrationTokensTable = PG.table("integration_tokens", {
	columns: {
		id: PG.column(uuid(IntegrationTokenId), { defaultExpr: "gen_random_uuid()" }),
		connectionId: uuid(IntegrationConnectionId),
		encryptedAccessToken: PG.text,
		encryptedRefreshToken: PG.nullable(PG.text),
		iv: varchar(32),
		refreshTokenIv: PG.nullable(varchar(32)),
		encryptionKeyVersion: PG.column(PG.int4, { default: 1 }),
		tokenType: PG.column(PG.nullable(varchar(50)), { default: "Bearer" }),
		scope: PG.nullable(PG.text),
		expiresAt: PG.nullable(timestamptz),
		refreshTokenExpiresAt: PG.nullable(timestamptz),
		lastRefreshedAt: PG.nullable(timestamptz),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: ["id"],
	uniqueConstraints: [PG.unique("integration_tokens_connectionId_unique", ["connectionId"])],
	indexes: [
		PG.index("int_tokens_connection_id_idx", ["connectionId"]),
		PG.index("int_tokens_expires_at_idx", ["expiresAt"]),
		PG.index("int_tokens_key_version_idx", ["encryptionKeyVersion"]),
	],
})
export type IntegrationToken = PG.SelectRowOf<typeof integrationTokensTable>
export type NewIntegrationToken = PG.InsertRowOf<typeof integrationTokensTable>
