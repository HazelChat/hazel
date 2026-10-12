// Prints the DDL the effect-orm tables describe, enum types first: the body of the initial migration
// (`--> statement-breakpoint` between statements), and the schema tests create.
import * as S from "@maple-dev/effect-orm/schema"
import { Effect } from "effect"
import * as Tables from "../src/tables"

const exported: ReadonlyArray<unknown> = Object.values(Tables)
const enums = exported.filter(
	(value): value is { enumName: string; enumValues: ReadonlyArray<string> } =>
		typeof value === "object" && value !== null && "enumName" in value,
)
/**
 * Unique keys `drizzle-kit push` created as UNIQUE constraints. effect-orm models them as unique
 * indexes; the initial migration creates the constraints, so a fresh database matches one push built.
 */
const UNIQUE_CONSTRAINTS = new Set([
	"bots_userId_unique",
	"integration_tokens_connectionId_unique",
	"org_members_org_user_unique",
	"organizations_slug_unique",
	"reactions_message_user_emoji_unique",
	"user_presence_status_userId_unique",
	"users_externalId_unique",
])

const asConstraint = (statement: string): string => {
	const match = /^CREATE UNIQUE INDEX IF NOT EXISTS "([^"]+)" ON "([^"]+)" USING btree \((.+)\);$/.exec(
		statement,
	)
	if (match === null || !UNIQUE_CONSTRAINTS.has(match[1]!)) return statement
	return `ALTER TABLE "${match[2]}" ADD CONSTRAINT "${match[1]}" UNIQUE (${match[3]});`
}

const statements = [
	...enums.map(
		(e) => `CREATE TYPE ${e.enumName} AS ENUM (${e.enumValues.map((v) => `'${v}'`).join(", ")});`,
	),
	...S.renderPgSchema(Effect.runSync(S.pgEntitiesOf(exported.filter(S.isSchemaObject)))).map((s) =>
		asConstraint(`${s};`),
	),
]
console.log(statements.join("\n--> statement-breakpoint\n"))
