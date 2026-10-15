import { Schema } from "effect"
import { Field, makeRules, Rule } from "foldkit/fieldValidation"
import { defineTaggedUnion } from "foldkit/schema"
import { Connection } from "../shared/connections"

export const CallbackStatus = Schema.Literals(["success", "error"])
export type CallbackStatus = typeof CallbackStatus.Type

/**
 * What the connection panel is waiting for. `Verifying` follows a successful OAuth callback until the
 * connection syncs in active; `Connecting` covers the OAuth URL request and the API key submit.
 */
export const Activity = defineTaggedUnion({
	Idle: {},
	Verifying: {},
	Connecting: {},
	Disconnecting: {},
})
export type Activity = typeof Activity.Type

const isBlank = (value: string) => value.trim() === ""
const isUrl = Rule.url()[0]

export const apiTokenRules = makeRules({ required: "Bearer token is required", isEmpty: isBlank })

/** The submit trims, so the URL check does too. */
export const apiBaseUrlRules = makeRules({
	required: "Base URL is required",
	isEmpty: isBlank,
	rules: [[(value: string) => isUrl(value.trim()), "Enter a full URL starting with https://"]],
})

export const Model = Schema.Struct({
	orgSlug: Schema.String,
	integrationId: Schema.String,
	/** The org-level connection for this provider (first row), if any. */
	connection: Schema.NullOr(Connection),
	activity: Activity,
	apiToken: Field(Schema.String),
	apiBaseUrl: Field(Schema.String),
	/** `ConfigOptionRow` toggles, local only as in legacy. */
	enabledOptionIds: Schema.Array(Schema.String),
})
export type Model = typeof Model.Type
