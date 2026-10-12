/**
 * Column types Hazel's tables share, beyond the ones `@maple-dev/effect-orm/postgres` ships.
 *
 * Timestamps read as `Date`, the shape the domain models and every caller already work with;
 * comparisons and writes also take a `DateTime.Utc` or an ISO string, as effect-orm's own
 * `timestamptz` does.
 */
import * as PG from "@maple-dev/effect-orm/postgres"
import { Schema, SchemaGetter } from "effect"

/** A timestamptz as a driver sends it (a `Date`, or Postgres's text form), read as a `Date`. */
const DateFromWire: Schema.Codec<Date, Date | string> = Schema.Union([
	Schema.Date,
	Schema.String.pipe(
		Schema.decodeTo(Schema.Date, {
			decode: SchemaGetter.transform((value: string) => new Date(PG.pgTimestampToIso(value))),
			encode: SchemaGetter.transform((value: Date) => value.toISOString()),
		}),
	),
])

/** `timestamp with time zone`, read and written as a `Date`. */
export const timestamptz: PG.PgType<"timestamptz", Date, Date | string> = PG.custom(
	"timestamptz",
	DateFromWire,
	PG.PgTimestampLiteral,
)

/** `varchar(length)`. */
export const varchar = (length: number): PG.PgType<string, string> =>
	PG.custom(`varchar(${length})`, Schema.String)

/**
 * A jsonb document typed as `A` without validating it, as drizzle's `jsonb().$type<A>()` was:
 * stored documents predate some of the shapes their readers expect, and a strict decode would
 * fail the whole read instead of the one field.
 */
export const jsonb = <A>(): PG.PgType<"jsonb", A, unknown> => PG.jsonb(Schema.Unknown as Schema.Codec<A, any>)

/** Narrows a column's TypeScript type without a runtime check (drizzle's `$type<A>()`). */
export const typed =
	<A>() =>
	<T extends PG.PgType<string, any, any>>(type: T): PG.PgType<string, A, PG.InferEncoded<T>> =>
		type as unknown as PG.PgType<string, A, PG.InferEncoded<T>>

/** A Postgres enum type, read as the union of its labels. The `CREATE TYPE` lives in a migration. */
export const pgEnum = <const Values extends readonly [string, ...Array<string>]>(
	name: string,
	values: Values,
) => Object.assign(PG.custom(name, Schema.Literals(values)), { enumName: name, enumValues: values })
