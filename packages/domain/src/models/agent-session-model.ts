import { AgentSessionId, SandboxId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const AgentType = Schema.Literal("claude", "codex", "opencode")
export type AgentType = Schema.Schema.Type<typeof AgentType>

export const AgentSessionStatus = Schema.Literal(
	"creating",
	"active",
	"waiting_input", // Waiting for HITL response
	"completed",
	"failed",
	"cancelled",
)
export type AgentSessionStatus = Schema.Schema.Type<typeof AgentSessionStatus>

export class Model extends M.Class<Model>("AgentSession")({
	id: M.Generated(AgentSessionId),
	sandboxId: SandboxId,
	userId: UserId,
	externalSessionId: Schema.String,
	agent: AgentType,
	status: AgentSessionStatus,
	workingDirectory: Schema.NullOr(Schema.String),
	lastMessage: Schema.NullOr(Schema.String),
	metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(JsonDate),
	endedAt: Schema.NullOr(JsonDate),
	deletedAt: Schema.NullOr(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update
