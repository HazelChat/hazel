import { Effect, Option, type Schema } from "effect"
import * as KeyValueStore from "effect/persistence/KeyValueStore"
import { layer as platformStorageLayer } from "~/lib/platform-storage/platform-key-value-store"

/**
 * Persisted settings (localStorage on the web, the Tauri store on desktop), with the keys and schema store
 * encoding the legacy app used, so values saved before the Foldkit app still load.
 */

/** The stored value, or `None` when it is missing or undecodable (callers then use their default). */
export const readStored = <S extends Schema.Constraint>(key: string, schema: S) =>
	KeyValueStore.KeyValueStore.use((store) => KeyValueStore.toSchemaStore(store, schema).get(key)).pipe(
		Effect.provide(platformStorageLayer),
		Effect.catch(() => Effect.succeed(Option.none<S["Type"]>())),
	)

export const writeStored = <S extends Schema.Constraint>(key: string, schema: S, value: S["Type"]) =>
	KeyValueStore.KeyValueStore.use((store) =>
		KeyValueStore.toSchemaStore(store, schema).set(key, value),
	).pipe(Effect.provide(platformStorageLayer), Effect.ignore)
