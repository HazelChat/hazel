import { SandboxId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const SandboxProvider = Schema.Literal("e2b", "daytona")
export type SandboxProvider = Schema.Schema.Type<typeof SandboxProvider>

export const SandboxStatus = Schema.Literal(
	"provisioning",
	"running",
	"stopping",
	"stopped",
	"failed",
	"expired",
)
export type SandboxStatus = Schema.Schema.Type<typeof SandboxStatus>

export class Model extends M.Class<Model>("Sandbox")({
	id: M.Generated(SandboxId),
	userId: UserId,
	provider: SandboxProvider,
	externalSandboxId: Schema.String,
	publicUrl: Schema.NullOr(Schema.String),
	status: SandboxStatus,
	name: Schema.NullOr(Schema.String),
	errorMessage: Schema.NullOr(Schema.String),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(JsonDate),
	expiresAt: Schema.NullOr(JsonDate),
	deletedAt: Schema.NullOr(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update
