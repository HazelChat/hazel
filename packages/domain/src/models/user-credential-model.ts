import { UserCredentialId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import * as M from "./utils"
import { JsonDate } from "./utils"

export const CredentialProvider = Schema.Literal("anthropic", "openai", "e2b", "daytona")
export type CredentialProvider = Schema.Schema.Type<typeof CredentialProvider>

export class Model extends M.Class<Model>("UserCredential")({
	id: M.Generated(UserCredentialId),
	userId: UserId,
	provider: CredentialProvider,
	// Note: encryptedKey is NOT exposed via JSON - only used server-side
	keyHint: Schema.NullOr(Schema.String), // Last 4 chars for display (e.g., "...abcd")
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(JsonDate),
	deletedAt: Schema.NullOr(JsonDate),
}) {}

export const Insert = Model.insert
export const Update = Model.update
