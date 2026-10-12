import { IntegrationRequestId, OrganizationId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, pgEnum, timestamptz, uuid, varchar } from "./columns"

export const integrationRequestStatusEnum = pgEnum("integration_request_status", [
	"pending",
	"reviewed",
	"planned",
	"rejected",
])

export const integrationRequestsTable = PG.table("integration_requests", {
	columns: {
		id: PG.column(uuid(IntegrationRequestId), { defaultExpr: "gen_random_uuid()" }),
		organizationId: uuid(OrganizationId),
		requestedBy: uuid(UserId),
		integrationName: varchar(255),
		integrationUrl: PG.nullable(varchar(500)),
		description: PG.nullable(PG.text),
		status: PG.column(integrationRequestStatusEnum, { default: "pending" }),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("integration_requests_organization_id_idx", ["organizationId"]),
		PG.index("integration_requests_status_idx", ["status"]),
		PG.index("integration_requests_created_at_idx", ["createdAt"]),
	],
})
export type IntegrationRequest = PG.SelectRowOf<typeof integrationRequestsTable>
export type NewIntegrationRequest = PG.InsertRowOf<typeof integrationRequestsTable>
