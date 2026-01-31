import type { UserCredentialId, UserId } from "@hazel/schema"
import { index, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"

export const credentialProviderEnum = pgEnum("credential_provider", ["anthropic", "openai", "e2b", "daytona"])

export const userCredentialsTable = pgTable(
	"user_credentials",
	{
		id: uuid().primaryKey().defaultRandom().$type<UserCredentialId>(),
		userId: uuid().notNull().$type<UserId>(),
		provider: credentialProviderEnum().notNull(),
		encryptedKey: text().notNull(), // Encrypted API key
		keyHint: text(), // Last 4 characters for display (e.g., "...abcd")
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("user_credentials_user_id_idx").on(table.userId),
		index("user_credentials_provider_idx").on(table.provider),
		index("user_credentials_deleted_at_idx").on(table.deletedAt),
		// Each user can only have one credential per provider
		unique("user_credentials_user_provider_unique").on(table.userId, table.provider),
	],
)

// Type exports
export type UserCredential = typeof userCredentialsTable.$inferSelect
export type NewUserCredential = typeof userCredentialsTable.$inferInsert
