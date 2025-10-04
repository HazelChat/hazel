import type { GetExtensions, Row, ShapeStreamOptions } from "@electric-sql/client"
import type { StandardSchemaV1 } from "@standard-schema/spec"
import type {
	DeleteMutationFnParams,
	InsertMutationFnParams,
	UpdateMutationFnParams,
	UtilsRecord,
} from "@tanstack/db"
import type { Txid } from "@tanstack/electric-db-collection"
import type { Effect } from "effect"

/**
 * Effect-based insert handler
 * Note: Handlers must be self-contained with all dependencies provided.
 * Use Effect.provideService or Layer.provide to inject dependencies before returning.
 */
export type EffectInsertHandler<
	T extends Row<unknown>,
	TKey extends string | number,
	TUtils extends UtilsRecord,
	E = never,
> = (params: InsertMutationFnParams<T, TKey, TUtils>) => Effect.Effect<{ txid: Txid | Array<Txid> }, E, never>

/**
 * Effect-based update handler
 * Note: Handlers must be self-contained with all dependencies provided.
 * Use Effect.provideService or Layer.provide to inject dependencies before returning.
 */
export type EffectUpdateHandler<
	T extends Row<unknown>,
	TKey extends string | number,
	TUtils extends UtilsRecord,
	E = never,
> = (params: UpdateMutationFnParams<T, TKey, TUtils>) => Effect.Effect<{ txid: Txid | Array<Txid> }, E, never>

/**
 * Effect-based delete handler
 * Note: Handlers must be self-contained with all dependencies provided.
 * Use Effect.provideService or Layer.provide to inject dependencies before returning.
 */
export type EffectDeleteHandler<
	T extends Row<unknown>,
	TKey extends string | number,
	TUtils extends UtilsRecord,
	E = never,
> = (params: DeleteMutationFnParams<T, TKey, TUtils>) => Effect.Effect<{ txid: Txid | Array<Txid> }, E, never>

/**
 * Configuration for Electric collection with Effect-based handlers
 */
export interface EffectElectricCollectionConfig<
	T extends Row<unknown> = Row<unknown>,
	TKey extends string | number = string | number,
	TSchema extends StandardSchemaV1 = never,
	TUtils extends UtilsRecord = Record<string, never>,
	E = never,
> {
	/**
	 * Unique identifier for the collection
	 */
	id?: string

	/**
	 * Configuration options for the ElectricSQL ShapeStream
	 */
	shapeOptions: ShapeStreamOptions<GetExtensions<T>>

	/**
	 * Function to extract the key from an item
	 */
	getKey: (item: T) => TKey

	/**
	 * Optional schema for validation
	 */
	schema?: TSchema

	/**
	 * Effect-based insert handler (must be self-contained, all dependencies provided)
	 */
	onInsert?: EffectInsertHandler<T, TKey, TUtils, E>

	/**
	 * Effect-based update handler (must be self-contained, all dependencies provided)
	 */
	onUpdate?: EffectUpdateHandler<T, TKey, TUtils, E>

	/**
	 * Effect-based delete handler (must be self-contained, all dependencies provided)
	 */
	onDelete?: EffectDeleteHandler<T, TKey, TUtils, E>

	/**
	 * Time in milliseconds after which the collection will be garbage collected
	 */
	gcTime?: number

	/**
	 * Whether to eagerly start syncing on collection creation
	 */
	startSync?: boolean

	/**
	 * Auto-indexing mode for the collection
	 */
	autoIndex?: `off` | `eager`

	/**
	 * Optional function to compare two items
	 */
	compare?: (x: T, y: T) => number
}
