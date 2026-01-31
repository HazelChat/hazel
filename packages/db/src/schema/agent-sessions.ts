import type { AgentSessionId, SandboxId, UserId } from "@hazel/schema"
import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export const agentTypeEnum = pgEnum("agent_type", ["claude", "codex", "opencode"])

export const agentSessionStatusEnum = pgEnum("agent_session_status", [
	"creating",
	"active",
	"waiting_input", // Waiting for HITL response
	"completed",
	"failed",
	"cancelled",
])

export const agentSessionsTable = pgTable(
	"agent_sessions",
	{
		id: uuid().primaryKey().defaultRandom().$type<AgentSessionId>(),
		sandboxId: uuid().notNull().$type<SandboxId>(),
		userId: uuid().notNull().$type<UserId>(),
		externalSessionId: varchar({ length: 255 }).notNull(), // Session ID from sandbox-agent
		agent: agentTypeEnum().notNull(),
		status: agentSessionStatusEnum().notNull().default("creating"),
		workingDirectory: text(), // Current working directory in sandbox
		lastMessage: text(), // Last message sent/received
		metadata: jsonb().$type<Record<string, unknown>>(), // Additional session metadata
		createdAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date", withTimezone: true }).notNull().defaultNow(),
		endedAt: timestamp({ mode: "date", withTimezone: true }), // When session ended
		deletedAt: timestamp({ mode: "date", withTimezone: true }),
	},
	(table) => [
		index("agent_sessions_sandbox_id_idx").on(table.sandboxId),
		index("agent_sessions_user_id_idx").on(table.userId),
		index("agent_sessions_agent_idx").on(table.agent),
		index("agent_sessions_status_idx").on(table.status),
		index("agent_sessions_deleted_at_idx").on(table.deletedAt),
	],
)

// Type exports
export type AgentSession = typeof agentSessionsTable.$inferSelect
export type NewAgentSession = typeof agentSessionsTable.$inferInsert
