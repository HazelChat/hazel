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
const statements = [
	...enums.map(
		(e) => `CREATE TYPE ${e.enumName} AS ENUM (${e.enumValues.map((v) => `'${v}'`).join(", ")});`,
	),
	...S.renderPgSchema(Effect.runSync(S.pgEntitiesOf(exported.filter(S.isSchemaObject)))).map(
		(s) => `${s};`,
	),
]
console.log(statements.join("\n--> statement-breakpoint\n"))
