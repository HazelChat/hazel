import { IntegrationConnectionId, OrganizationId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { jsonb, pgEnum, timestamptz, typed, varchar } from "./columns"

export const connectionLevelEnum = pgEnum("connection_level", ["organization", "user"])
export const connectionStatusEnum = pgEnum("connection_status", [
	"active",
	"expired",
	"revoked",
	"error",
	"suspended",
])

export const integrationConnectionsTable = PG.table("integration_connections", {
	columns: {
		id: PG.column(PG.brand(PG.uuid, IntegrationConnectionId), { defaultExpr: "gen_random_uuid()" }),
		provider: typed<"linear" | "github" | "figma" | "notion" | "discord" | "craft">()(varchar(50)),
		organizationId: PG.brand(PG.uuid, OrganizationId),
		userId: PG.nullable(PG.brand(PG.uuid, UserId)),
		level: connectionLevelEnum,
		status: PG.column(connectionStatusEnum, { default: "active" }),
		externalAccountId: PG.nullable(varchar(255)),
		externalAccountName: PG.nullable(varchar(255)),
		connectedBy: PG.brand(PG.uuid, UserId),
		settings: PG.nullable(jsonb<Record<string, any>>()),
		metadata: PG.nullable(jsonb<Record<string, any>>()),
		errorMessage: PG.nullable(PG.text),
		lastUsedAt: PG.nullable(timestamptz),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("int_conn_org_idx", ["organizationId"]),
		PG.index("int_conn_provider_idx", ["provider"]),
		PG.index("int_conn_status_idx", ["status"]),
		PG.index("int_conn_deleted_at_idx", ["deletedAt"]),
		PG.uniqueIndex("int_conn_org_user_provider_unique", ["organizationId", "userId", "provider"]),
		PG.uniqueIndex(
			"int_conn_org_provider_external_user_unique",
			["organizationId", "provider", "externalAccountId"],
			{
				where: '"deletedAt" IS NULL\n\t\t\t\t\tAND "level" = \'user\'\n\t\t\t\t\tAND "externalAccountId" IS NOT NULL',
			},
		),
		PG.index("int_conn_github_installation_idx", ($) => [PG.jsonText($.metadata!, "installationId")]),
	],
})
export type IntegrationConnection = PG.SelectRowOf<typeof integrationConnectionsTable>
export type NewIntegrationConnection = PG.InsertRowOf<typeof integrationConnectionsTable>
