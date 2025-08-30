import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// User status enum
export const userStatusEnum = pgEnum("user_status", ["online", "offline", "away"])

// Users table - stores user profiles
export const usersTable = pgTable(
	"users",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		externalId: varchar("external_id", { length: 255 }).notNull().unique(), // WorkOS/Clerk ID
		email: varchar("email", { length: 255 }).notNull(),
		firstName: varchar("first_name", { length: 100 }).notNull(),
		lastName: varchar("last_name", { length: 100 }).notNull(),
		avatarUrl: text("avatar_url").notNull(),
		status: userStatusEnum("status").notNull().default("offline"),
		lastSeen: timestamp("last_seen", { mode: "date" }).notNull().defaultNow(),
		settings: text("settings").default("{}"), // JSONB stored as text for now
		createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
		deletedAt: timestamp("deleted_at", { mode: "date" }),
	},
	(table) => [
		index("users_external_id_idx").on(table.externalId),
		index("users_email_idx").on(table.email),
		index("users_deleted_at_idx").on(table.deletedAt),
	],
)

// Type exports
export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
