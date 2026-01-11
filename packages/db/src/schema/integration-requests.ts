import type { IntegrationRequestId, OrganizationId, UserId } from "@hazel/schema"
import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// Integration request status
export const integrationRequestStatusEnum = pgEnum("integration_request_status", [
	"pending",
	"reviewed",
	"planned",
	"rejected",
])

// Integration requests table
export const integrationRequestsTable = pgTable(
	"integration_requests",
	{
		id: uuid().primaryKey().defaultRandom().$type<IntegrationRequestId>(),
		organizationId: uuid().notNull().$type<OrganizationId>(),
		requestedBy: uuid().notNull().$type<UserId>(),
		integrationName: varchar({ length: 255 }).notNull(),
		integrationUrl: varchar({ length: 500 }),
		description: text(),
		status: integrationRequestStatusEnum().notNull().default("pending"),
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index("integration_requests_organization_id_idx").on(table.organizationId),
		index("integration_requests_status_idx").on(table.status),
		index("integration_requests_created_at_idx").on(table.createdAt),
	],
)

// Type exports
export type IntegrationRequest = typeof integrationRequestsTable.$inferSelect
export type NewIntegrationRequest = typeof integrationRequestsTable.$inferInsert
