import { policyRequire } from "@hazel/domain"
import type { InferSelectModel, Table } from "drizzle-orm"
import { eq } from "drizzle-orm"
import { pipe } from "effect"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import type { ParseError } from "effect/ParseResult"
import * as Schema from "effect/Schema"
import { Database, type DatabaseError, type TransactionClient } from "./database"
import { EntityNotFound, type EntitySchema, type Repository, type RepositoryOptions } from "./model"

type TxFn = <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, DatabaseError, never>

export function makeRepository<
	T extends Table<any>,
	Col extends keyof InferSelectModel<T>,
	Name extends string,
	RecordType extends InferSelectModel<T>,
	S extends EntitySchema,
	Id extends InferSelectModel<T>[Col],
>(
	table: T,
	schema: S,
	options: RepositoryOptions<Col, Name>,
): Effect.Effect<Repository<RecordType, S, Col, Name, Id>, never, Database> {
	return Effect.gen(function* () {
		const db = yield* Database
		const { idColumn } = options

		const insert = (data: S["insert"]["Type"], tx?: TxFn) =>
			pipe(
				db.makeQueryWithSchema(
					schema.insert as Schema.Schema<S["insert"]>,
					(execute, input) => execute((client) => client.insert(table).values([input]).returning()),
					policyRequire(options.name, "create"),
				)(data, tx),
			) as unknown as Effect.Effect<RecordType[], DatabaseError | ParseError>

		const insertVoid = (data: S["insert"]["Type"], tx?: TxFn) =>
			db.makeQueryWithSchema(
				schema.insert as Schema.Schema<S["insert"]>,
				(execute, input) => execute((client) => client.insert(table).values(input)),
				policyRequire(options.name, "create"),
			)(data, tx) as unknown as Effect.Effect<void, DatabaseError | ParseError>

		const update = (data: S["update"]["Type"], tx?: TxFn) =>
			db.makeQueryWithSchema(
				Schema.partial(schema.update as Schema.Schema<S["update"]>),
				(execute, input) =>
					execute((client) =>
						client
							.update(table)
							.set(input)
							// @ts-expect-error
							.where(eq(table[idColumn], input[idColumn]))
							.returning(),
					).pipe(
						Effect.flatMap((result) =>
							result.length > 0
								? Effect.succeed(result[0] as RecordType)
								: Effect.die(new EntityNotFound({ type: options.name, id: input[idColumn] })),
						),
					),
				policyRequire(options.name, "update"),
			)(data, tx) as Effect.Effect<RecordType, DatabaseError | ParseError>

		const updateVoid = (data: S["update"]["Type"], tx?: TxFn) =>
			db.makeQueryWithSchema(
				Schema.partial(schema.update as Schema.Schema<S["update"]>),
				(execute, input) =>
					execute((client) =>
						client
							.update(table)
							.set(input)
							// @ts-expect-error
							.where(eq(table[idColumn], input[idColumn])),
					),
				policyRequire(options.name, "update"),
			)(data, tx) as unknown as Effect.Effect<void, DatabaseError | ParseError>

		const findById = (id: Id, tx?: TxFn) =>
			db.makeQuery(
				(execute, id: Id) =>
					execute((client) =>
						client
							.select()
							.from(table as Table<any>)
							// @ts-expect-error
							.where(eq(table[idColumn], id))
							.limit(1),
					).pipe(Effect.map((results) => Option.fromNullable(results[0] as RecordType))),
				policyRequire(options.name, "select"),
			)(id, tx) as Effect.Effect<Option.Option<RecordType>, DatabaseError>

		const deleteById = (id: Id, tx?: TxFn) =>
			db.makeQuery(
				(execute, id: Id) =>
					// @ts-expect-error
					execute((client) => client.delete(table).where(eq(table[idColumn], id))),
				policyRequire(options.name, "delete"),
			)(id, tx) as Effect.Effect<unknown, DatabaseError>

		const with_ = <A, E, R>(
			id: Id,
			f: (item: RecordType) => Effect.Effect<A, E, R>,
		): Effect.Effect<A, E | EntityNotFound, R> =>
			pipe(
				findById(id),
				Effect.flatMap(
					Option.match({
						onNone: () => Effect.fail(new EntityNotFound({ type: options.name, id })),
						onSome: Effect.succeed,
					}),
				),
				Effect.flatMap(f),
				Effect.catchTag("DatabaseError", (err) => Effect.die(err)),
			)

		return {
			insert,
			insertVoid,
			update,
			updateVoid,
			findById,
			deleteById,
			with: with_,
		}
	})
}
