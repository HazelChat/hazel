// Prints the DDL the effect-orm tables describe, enum types first.
import * as S from "@maple-dev/effect-orm/schema"
import { Effect } from "effect"
import * as Tables from "../src/tables"

const enums = Object.values(Tables).filter(
	(value): value is { enumName: string; enumValues: ReadonlyArray<string> } =>
		typeof value === "object" && value !== null && "enumName" in value,
)
for (const e of enums) {
	console.log(`CREATE TYPE "${e.enumName}" AS ENUM (${e.enumValues.map((v) => `'${v}'`).join(", ")});`)
}
const tables = Object.values(Tables).filter(S.isSchemaObject)
for (const statement of S.renderPgSchema(Effect.runSync(S.pgEntitiesOf(tables)))) console.log(`${statement};`)
