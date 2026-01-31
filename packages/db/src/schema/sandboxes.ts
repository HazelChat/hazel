import type { SandboxId, UserId } from "@hazel/schema"
import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export const sandboxProviderEnum = pgEnum("sandbox_provider", ["e2b", "daytona"])

export const sandboxStatusEnum = pgEnum("sandbox_status", [
	"provisioning",
	"running",
	"stopping",
	"stopped",
	"failed",
	"expired",
])

export const sandboxesTable = pgTable(
	"sandboxes",
	{
		id: uuid().primaryKey().defaultRandom().$type<SandboxId>(),
		userId: uuid().notNull().$type<UserId>(),
		provider: sandboxProviderEnum().notNull(),
		externalSandboxId: varchar({ length: 255 }).notNull(), // Provider's sandbox ID
		publicUrl: text(), // URL to access sandbox-agent server
		status: sandboxStatusEnum().notNull().default("provisioning"),
		name: varchar({ length: 255 }), // Optional user-friendly name
		errorMessage: text(), // Error message if status is 'failed'
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		expiresAt: timestamp({ mode: "date", withTimezone: true }), // When sandbox will auto-terminate
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("sandboxes_user_id_idx").on(table.userId),
		index("sandboxes_status_idx").on(table.status),
		index("sandboxes_provider_idx").on(table.provider),
		index("sandboxes_expires_at_idx").on(table.expiresAt),
		index("sandboxes_deleted_at_idx").on(table.deletedAt),
	],
)

// Type exports
export type Sandbox = typeof sandboxesTable.$inferSelect
export type NewSandbox = typeof sandboxesTable.$inferInsert
