import * as VariantSchema from "effect/unstable/schema/VariantSchema"
import type { Brand } from "effect/Brand"
import * as DateTime from "effect/DateTime"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as SchemaIssue from "effect/SchemaIssue"

const { Class, Field, FieldExcept, FieldOnly, Struct, Union, extract, fieldEvolve, fieldFromKey } =
	VariantSchema.make({
		variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
		defaultVariant: "select",
	})

export type Any = Schema.Top & {
	readonly fields: Schema.Struct.Fields
	readonly insert: Schema.Top
	readonly update: Schema.Top
	readonly json: Schema.Top
	readonly jsonCreate: Schema.Top
	readonly jsonUpdate: Schema.Top
}

export type AnyNoContext = Schema.Top & {
	readonly fields: Schema.Struct.Fields
	readonly insert: Schema.Top
	readonly update: Schema.Top
	readonly json: Schema.Top
	readonly jsonCreate: Schema.Top
	readonly jsonUpdate: Schema.Top
}

export type VariantsDatabase = "select" | "insert" | "update"

export type VariantsJson = "json" | "jsonCreate" | "jsonUpdate"

export {
	/**
	 * A base class for creating domain model schemas with variants for database and JSON APIs.
	 *
	 * @example
	 * ```ts
	 * export class Group extends Model.Class<Group>("Group")({
	 *   id: Model.Generated(GroupId),
	 *   name: Schema.NonEmptyTrimmedString,
	 *   createdAt: Model.DateTimeInsertFromDate,
	 *   updatedAt: Model.DateTimeUpdateFromDate
	 * }) {}
	 *
	 * Group.insert        // for inserts
	 * Group.update        // for updates
	 * Group.json          // for JSON API
	 * Group.jsonCreate    // for JSON creation
	 * Group.jsonUpdate    // for JSON updates
	 * ```
	 */
	Class,
	extract,
	Field,
	fieldEvolve,
	FieldExcept,
	fieldFromKey,
	FieldOnly,
	Struct,
	Union,
}

export const fields: <A extends VariantSchema.Struct<any>>(self: A) => A[VariantSchema.TypeId] =
	VariantSchema.fields

export const Override: <A>(value: A) => A & Brand<"Override"> = VariantSchema.Override

export interface Generated<
	S extends Schema.Top,
> extends VariantSchema.Field<{
	readonly select: S
	readonly update: S
	readonly json: S
}> {}

/** A field for database-generated columns (available for select and update, not insert). */
export const Generated = <S extends Schema.Top>(
	schema: S,
): Generated<S> =>
	Field({
		select: schema,
		update: schema,
		json: schema,
	})

export interface GeneratedOptional<S extends Schema.Top> extends VariantSchema.Field<{
	readonly select: S
	readonly insert: Schema.optionalKey<S>
	readonly update: S
	readonly json: S
	readonly jsonCreate: Schema.optionalKey<S>
}> {}

/**
 * A field for database-generated columns that can optionally be overridden on insert.
 * Useful for supporting optimistic updates where the client generates the ID upfront.
 * - Required for select, update, and json
 * - Optional for insert and jsonCreate (if not provided, DB generates the value)
 */
export const GeneratedOptional = <S extends Schema.Top>(schema: S): GeneratedOptional<S> =>
	Field({
		select: schema,
		insert: Schema.optionalKey(schema),
		update: schema,
		json: schema,
		jsonCreate: Schema.optionalKey(schema),
	})

export interface GeneratedByApp<
	S extends Schema.Top,
> extends VariantSchema.Field<{
	readonly select: S
	readonly insert: S
	readonly update: S
	readonly json: S
}> {}

/** A field for application-generated columns (required for DB variants, optional for JSON). */
export const GeneratedByApp = <S extends Schema.Top>(
	schema: S,
): GeneratedByApp<S> =>
	Field({
		select: schema,
		insert: schema,
		update: schema,
		json: schema,
	})

export interface Sensitive<
	S extends Schema.Top,
> extends VariantSchema.Field<{
	readonly select: S
	readonly insert: S
	readonly update: S
}> {}

/** A field for sensitive values hidden from JSON variants. */
export const Sensitive = <S extends Schema.Top>(
	schema: S,
): Sensitive<S> =>
	Field({
		select: schema,
		insert: schema,
		update: schema,
	})

export interface FieldOption<S extends Schema.Top> extends VariantSchema.Field<{
	readonly select: Schema.OptionFromNullOr<S>
	readonly insert: Schema.OptionFromNullOr<S>
	readonly update: Schema.OptionFromNullOr<S>
	readonly json: Schema.OptionFromOptionalNullOr<S>
	readonly jsonCreate: Schema.OptionFromOptionalNullOr<S>
	readonly jsonUpdate: Schema.OptionFromOptionalNullOr<S>
}> {}

/** Makes a field optional for all variants (nullable for DB, optional for JSON). */
export const FieldOption: <Field extends VariantSchema.Field<any> | Schema.Top>(
	self: Field,
) => Field extends Schema.Top
	? FieldOption<Field>
	: Field extends VariantSchema.Field<infer S>
		? VariantSchema.Field<{
				readonly [K in keyof S]: S[K] extends Schema.Top
					? K extends VariantsDatabase
						? Schema.OptionFromNullOr<S[K]>
						: Schema.OptionFromOptionalNullOr<S[K]>
					: never
			}>
		: never = fieldEvolve({
	select: Schema.OptionFromNullOr,
	insert: Schema.OptionFromNullOr,
	update: Schema.OptionFromNullOr,
	json: (s: any) => Schema.OptionFromOptionalNullOr(s),
	jsonCreate: (s: any) => Schema.OptionFromOptionalNullOr(s),
	jsonUpdate: (s: any) => Schema.OptionFromOptionalNullOr(s),
}) as any

export interface DateTimeFromDate extends Schema.DateTimeUtcFromDate {}

export const DateTimeFromDate: DateTimeFromDate = Schema.DateTimeUtcFromDate

export interface Date extends Schema.decodeTo<
	Schema.DateTimeUtc,
	Schema.String
> {}

/** A DateTime.Utc serialized as ISO date string (YYYY-MM-DD). */
export const Date: Date = Schema.String.pipe(
	Schema.decodeTo(Schema.DateTimeUtc, {
		decode: (s, _, ast) =>
			DateTime.make(s).pipe(
				(opt) => {
					if (opt._tag === "Some") {
						return Effect.succeed(DateTime.removeTime(opt.value))
					}
					return Effect.fail(new SchemaIssue.InvalidValue(ast, s))
				},
			),
		encode: (dt) => Effect.succeed(DateTime.formatIsoDate(dt)),
	}),
) as any

export const DateWithNow = VariantSchema.Overrideable(Date as any, {
	defaultValue: Effect.map(DateTime.now, DateTime.removeTime),
})

export const DateTimeWithNow = VariantSchema.Overrideable(Schema.DateTimeUtcFromString, {
	defaultValue: DateTime.now,
})

export const DateTimeFromDateWithNow = VariantSchema.Overrideable(
	Schema.DateTimeUtcFromDate,
	{
		defaultValue: DateTime.now,
	},
)

export const DateTimeFromNumberWithNow = VariantSchema.Overrideable(
	Schema.DateTimeUtcFromMillis,
	{
		defaultValue: DateTime.now,
	},
)

export interface DateTimeInsert extends VariantSchema.Field<{
	readonly select: typeof Schema.DateTimeUtcFromString
	readonly insert: VariantSchema.Overrideable<typeof Schema.DateTimeUtcFromString>
	readonly json: typeof Schema.DateTimeUtcFromString
}> {}

/** A DateTime.Utc field set on insert only, serialized as string (createdAt). */
export const DateTimeInsert: DateTimeInsert = Field({
	select: Schema.DateTimeUtcFromString,
	insert: DateTimeWithNow,
	json: Schema.DateTimeUtcFromString,
})

export interface DateTimeInsertFromDate extends VariantSchema.Field<{
	readonly select: DateTimeFromDate
	readonly insert: VariantSchema.Overrideable<typeof Schema.DateTimeUtcFromDate>
	readonly json: typeof Schema.DateTimeUtcFromString
}> {}

/** A DateTime.Utc field set on insert only, serialized as Date object. */
export const DateTimeInsertFromDate: DateTimeInsertFromDate = Field({
	select: DateTimeFromDate,
	insert: DateTimeFromDateWithNow,
	json: Schema.DateTimeUtcFromString,
})

export interface DateTimeInsertFromNumber extends VariantSchema.Field<{
	readonly select: typeof Schema.DateTimeUtcFromMillis
	readonly insert: VariantSchema.Overrideable<typeof Schema.DateTimeUtcFromMillis>
	readonly json: typeof Schema.DateTimeUtcFromMillis
}> {}

/** A DateTime.Utc field set on insert only, serialized as epoch milliseconds. */
export const DateTimeInsertFromNumber: DateTimeInsertFromNumber = Field({
	select: Schema.DateTimeUtcFromMillis,
	insert: DateTimeFromNumberWithNow,
	json: Schema.DateTimeUtcFromMillis,
})

export interface DateTimeUpdate extends VariantSchema.Field<{
	readonly select: typeof Schema.DateTimeUtcFromString
	readonly insert: VariantSchema.Overrideable<typeof Schema.DateTimeUtcFromString>
	readonly update: VariantSchema.Overrideable<typeof Schema.DateTimeUtcFromString>
	readonly json: typeof Schema.DateTimeUtcFromString
}> {}

/** A DateTime.Utc field set on insert/update, serialized as string (updatedAt). */
export const DateTimeUpdate: DateTimeUpdate = Field({
	select: Schema.DateTimeUtcFromString,
	insert: DateTimeWithNow,
	update: DateTimeWithNow,
	json: Schema.DateTimeUtcFromString,
})

export interface DateTimeUpdateFromDate extends VariantSchema.Field<{
	readonly select: DateTimeFromDate
	readonly insert: VariantSchema.Overrideable<typeof Schema.DateTimeUtcFromDate>
	readonly update: VariantSchema.Overrideable<typeof Schema.DateTimeUtcFromDate>
	readonly json: typeof Schema.DateTimeUtcFromString
}> {}

/** A DateTime.Utc field set on insert/update, serialized as Date object. */
export const DateTimeUpdateFromDate: DateTimeUpdateFromDate = Field({
	select: DateTimeFromDate,
	insert: DateTimeFromDateWithNow,
	update: DateTimeFromDateWithNow,
	json: Schema.DateTimeUtcFromString,
})

export interface DateTimeUpdateFromNumber extends VariantSchema.Field<{
	readonly select: typeof Schema.DateTimeUtcFromMillis
	readonly insert: VariantSchema.Overrideable<typeof Schema.DateTimeUtcFromMillis>
	readonly update: VariantSchema.Overrideable<typeof Schema.DateTimeUtcFromMillis>
	readonly json: typeof Schema.DateTimeUtcFromMillis
}> {}

/** A DateTime.Utc field set on insert/update, serialized as epoch milliseconds. */
export const DateTimeUpdateFromNumber: DateTimeUpdateFromNumber = Field({
	select: Schema.DateTimeUtcFromMillis,
	insert: DateTimeFromNumberWithNow,
	update: DateTimeFromNumberWithNow,
	json: Schema.DateTimeUtcFromMillis,
})

export interface JsonFromString<
	S extends Schema.Top,
> extends VariantSchema.Field<{
	readonly select: Schema.fromJsonString<S>
	readonly insert: Schema.fromJsonString<S>
	readonly update: Schema.fromJsonString<S>
	readonly json: S
	readonly jsonCreate: S
	readonly jsonUpdate: S
}> {}

/** A JSON value stored as text in the database, object in JSON variants. */
export const JsonFromString = <S extends Schema.Top>(
	schema: S,
): JsonFromString<S> => {
	const parsed = Schema.fromJsonString(schema)
	return Field({
		select: parsed,
		insert: parsed,
		update: parsed,
		json: schema,
		jsonCreate: schema,
		jsonUpdate: schema,
	}) as JsonFromString<S>
}

export interface UuidV4Insert<B extends string | symbol> extends VariantSchema.Field<{
	readonly select: Schema.brand<typeof Schema.Uint8Array, B>
	readonly insert: VariantSchema.Overrideable<Schema.brand<typeof Schema.Uint8Array, B>>
	readonly update: Schema.brand<typeof Schema.Uint8Array, B>
	readonly json: Schema.brand<typeof Schema.Uint8Array, B>
}> {}

export const UuidV4WithGenerate = <B extends string | symbol>(
	schema: Schema.brand<typeof Schema.Uint8Array, B>,
): VariantSchema.Overrideable<Schema.brand<typeof Schema.Uint8Array, B>> =>
	VariantSchema.Overrideable(schema, {
		defaultValue: Effect.sync(() => crypto.randomUUID() as any),
	})

/** A UUID v4 field auto-generated on insert. */
export const UuidV4Insert = <const B extends string | symbol>(
	schema: Schema.brand<typeof Schema.Uint8Array, B>,
): UuidV4Insert<B> =>
	Field({
		select: schema,
		insert: UuidV4WithGenerate(schema),
		update: schema,
		json: schema,
	})

/** A boolean parsed from 0 or 1. */
export const BooleanFromNumber: typeof Schema.BooleanFromBit = Schema.BooleanFromBit

export interface EntitySchema extends Schema.Top {
	readonly fields: Schema.Struct.Fields
	readonly insert: Schema.Top
	readonly update: Schema.Top
	readonly json: Schema.Top
	readonly jsonCreate: Schema.Top
	readonly jsonUpdate: Schema.Top
}

// Helper utilities for common model fields
export const JsonDate = Schema.Union([Schema.DateTimeUtcFromString, Schema.Date]).pipe(
	Schema.annotate({
		jsonSchema: { type: "string", format: "date-time" },
	}),
)

export const baseFields = {
	createdAt: Generated(JsonDate),
	updatedAt: Generated(Schema.NullOr(JsonDate)),
	deletedAt: GeneratedByApp(Schema.NullOr(JsonDate)),
}
