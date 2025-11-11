/**
 * Re-export model utilities from domain and add db-specific Repository types.
 */
import * as Model from "@hazel/domain/models"

export * from "@hazel/domain/models"

import type { AuthorizedActor } from "@hazel/domain"
import type { EntitySchema } from "@hazel/domain/models"
import type * as Effect from "effect/Effect"
import type * as Option from "effect/Option"
import type { ParseError } from "effect/ParseResult"
import * as Schema from "effect/Schema"
import type { DatabaseError, TransactionClient } from "./database"

export interface RepositoryOptions<Col extends string, Name extends string> {
	idColumn: Col
	name: Name
}

export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

export class EntityNotFound extends Schema.TaggedError<EntityNotFound>()("EntityNotFound", {
	type: Schema.String,
	id: Schema.Any,
}) {}

export interface Repository<RecordType, S extends EntitySchema, Col extends string, Name extends string, Id> {
	readonly insert: (
		insert: S["insert"]["Type"],
		tx?: <U>(fn: (client: TransactionClient) => Promise<U>) => Effect.Effect<U, DatabaseError>,
	) => Effect.Effect<RecordType[], DatabaseError | ParseError, AuthorizedActor<Name, "create">>

	readonly insertVoid: (
		insert: S["insert"]["Type"],
		tx?: <U>(fn: (client: TransactionClient) => Promise<U>) => Effect.Effect<U, DatabaseError>,
	) => Effect.Effect<void, DatabaseError | ParseError, AuthorizedActor<Name, "create">>

	readonly update: (
		update: PartialExcept<S["update"]["Type"], Col>,
		tx?: <U>(fn: (client: TransactionClient) => Promise<U>) => Effect.Effect<U, DatabaseError>,
	) => Effect.Effect<RecordType, DatabaseError | ParseError, AuthorizedActor<Name, "update">>

	readonly updateVoid: (
		update: PartialExcept<S["update"]["Type"], Col>,
		tx?: <U>(fn: (client: TransactionClient) => Promise<U>) => Effect.Effect<U, DatabaseError>,
	) => Effect.Effect<void, DatabaseError | ParseError, AuthorizedActor<Name, "update">>

	// readonly updateManyVoid: (
	//   update: PartialExcept<S["update"]["Type"], Col>[]
	// ) => Effect.Effect<void, DatabaseError | ParseError>

	readonly findById: (
		id: Id,
		tx?: <U>(fn: (client: TransactionClient) => Promise<U>) => Effect.Effect<U, DatabaseError>,
	) => Effect.Effect<Option.Option<RecordType>, DatabaseError, AuthorizedActor<Name, "select">>

	readonly with: <A, E, R>(
		id: Id,
		f: (item: RecordType) => Effect.Effect<A, E, R>,
	) => Effect.Effect<A, E | EntityNotFound, R>

	readonly deleteById: (
		id: Id,
		tx?: <U>(fn: (client: TransactionClient) => Promise<U>) => Effect.Effect<U, DatabaseError>,
	) => Effect.Effect<void, DatabaseError, AuthorizedActor<Name, "delete">>
}
