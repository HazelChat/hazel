import type { Row } from "@electric-sql/client"
import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { Collection } from "@tanstack/db"
import { createCollection } from "@tanstack/db"
import type { Txid } from "@tanstack/electric-db-collection"
import { Context, Effect, Layer } from "effect"
import { effectElectricCollectionOptions } from "./collection"
import { DeleteError, InsertError, type InvalidTxIdError, type TxIdTimeoutError, UpdateError } from "./errors"
import type { EffectElectricCollectionConfig } from "./types"

type InferSchemaOutput<T> = T extends StandardSchemaV1
	? StandardSchemaV1.InferOutput<T> extends Row<unknown>
		? StandardSchemaV1.InferOutput<T>
		: Record<string, unknown>
	: Record<string, unknown>

/**
 * Service interface for an Effect-based Electric collection
 */
export interface ElectricCollectionService<
	T extends Row<unknown> = Row<unknown>,
	TKey extends string | number = string | number,
> {
	/**
	 * The underlying collection instance
	 */
	readonly collection: Collection<T, TKey>

	/**
	 * Insert one or more items (Effect version)
	 */
	readonly insert: (data: T | Array<T>) => Effect.Effect<void, InsertError, never>

	/**
	 * Update one or more items (Effect version)
	 */
	readonly update: (
		keys: TKey | Array<TKey>,
		updateFn: (draft: T) => void,
	) => Effect.Effect<void, UpdateError, never>

	/**
	 * Delete one or more items (Effect version)
	 */
	readonly delete: (keys: TKey | Array<TKey>) => Effect.Effect<void, DeleteError, never>

	/**
	 * Get an item by key
	 */
	readonly get: (key: TKey) => Effect.Effect<T | undefined, never, never>

	/**
	 * Check if an item exists
	 */
	readonly has: (key: TKey) => Effect.Effect<boolean, never, never>

	/**
	 * Get the collection state
	 */
	readonly state: Effect.Effect<Map<TKey, T>, never, never>

	/**
	 * Get the collection state as an array
	 */
	readonly toArray: Effect.Effect<Array<T>, never, never>

	/**
	 * Wait for a transaction ID to sync
	 */
	readonly awaitTxId: (
		txid: Txid,
		timeout?: number,
	) => Effect.Effect<boolean, TxIdTimeoutError | InvalidTxIdError, never>

	/**
	 * Preload the collection
	 */
	readonly preload: () => Effect.Effect<void, never, never>
}

/**
 * Create a tag for an Electric collection service
 */
export const ElectricCollection = <T extends Row<unknown>, TKey extends string | number = string | number>(
	id: string,
): Context.Tag<ElectricCollectionService<T, TKey>, ElectricCollectionService<T, TKey>> =>
	Context.GenericTag<ElectricCollectionService<T, TKey>>(`ElectricCollection<${id}>`)

/**
 * Create a Layer for an Electric collection service
 */
export function makeElectricCollectionLayer<T extends StandardSchemaV1>(
	tag: Context.Tag<
		ElectricCollectionService<InferSchemaOutput<T>, string | number>,
		ElectricCollectionService<InferSchemaOutput<T>, string | number>
	>,
	config: EffectElectricCollectionConfig<InferSchemaOutput<T>, string | number, T> & {
		schema: T
	},
): Layer.Layer<ElectricCollectionService<InferSchemaOutput<T>, string | number>, never, never>

export function makeElectricCollectionLayer<T extends Row<unknown>>(
	tag: Context.Tag<
		ElectricCollectionService<T, string | number>,
		ElectricCollectionService<T, string | number>
	>,
	config: EffectElectricCollectionConfig<T> & {
		schema?: never
	},
): Layer.Layer<ElectricCollectionService<T, string | number>, never, never>

export function makeElectricCollectionLayer(
	tag: Context.Tag<any, any>,
	config: EffectElectricCollectionConfig<any, any, any>,
): Layer.Layer<any, never, never> {
	return Layer.succeed(
		tag,
		(() => {
			const collectionOptions = effectElectricCollectionOptions(config as any)
			const collection = createCollection(collectionOptions as any)

			const service: ElectricCollectionService<any, any> = {
				collection,

				insert: (data) =>
					Effect.async<void, InsertError>((resume) => {
						const tx = collection.insert(data)
						tx.isPersisted.promise
							.then(() => resume(Effect.void))
							.catch((error) =>
								resume(
									Effect.fail(
										new InsertError({
											message: "Insert operation failed",
											data,
											cause: error,
										}),
									),
								),
							)
					}),

				update: (keys, updateFn) =>
					Effect.async<void, UpdateError>((resume) => {
						const tx = collection.update(keys as any, updateFn as any)
						tx.isPersisted.promise
							.then(() => resume(Effect.void))
							.catch((error) =>
								resume(
									Effect.fail(
										new UpdateError({
											message: "Update operation failed",
											key: keys,
											cause: error,
										}),
									),
								),
							)
					}),

				delete: (keys) =>
					Effect.async<void, DeleteError>((resume) => {
						const tx = collection.delete(keys as any)
						tx.isPersisted.promise
							.then(() => resume(Effect.void))
							.catch((error) =>
								resume(
									Effect.fail(
										new DeleteError({
											message: "Delete operation failed",
											key: keys,
											cause: error,
										}),
									),
								),
							)
					}),

				get: (key) => Effect.sync(() => collection.get(key)),

				has: (key) => Effect.sync(() => collection.has(key)),

				state: Effect.sync(() => collection.state),

				toArray: Effect.sync(() => collection.toArray),

				awaitTxId: (txid, timeout) => (collectionOptions.utils as any).awaitTxIdEffect(txid, timeout),

				preload: () => Effect.promise(() => collection.preload()),
			}

			return service
		})(),
	)
}
