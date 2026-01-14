/**
 * @module TauriKeyValueStore
 * @platform desktop
 * @description Effect KeyValueStore implementation using Tauri's plugin-store
 *
 * Uses @tauri-apps/plugin-store for persistent key-value storage on desktop.
 * Store file: settings.json (separate from auth.json used for tokens)
 */

import * as KeyValueStore from "@effect/platform/KeyValueStore"
import { SystemError } from "@effect/platform/Error"
import { Effect, Layer, Option } from "effect"

const STORE_NAME = "settings.json"

// Promise caching pattern to prevent race conditions during concurrent initialization
type StoreType = Awaited<ReturnType<typeof import("@tauri-apps/plugin-store").load>>
let storePromise: Promise<StoreType> | null = null

const getStore = Effect.tryPromise({
	try: async () => {
		// Use promise caching to ensure only one store instance is created
		// even if getStore is called concurrently
		if (!storePromise) {
			storePromise = import("@tauri-apps/plugin-store").then(({ load }) =>
				load(STORE_NAME, {
					autoSave: true,
					defaults: {},
				}),
			)
		}
		return storePromise
	},
	catch: (error) =>
		new SystemError({
			reason: "Unknown",
			module: "KeyValueStore",
			method: "getStore",
			pathOrDescriptor: STORE_NAME,
			description: `Failed to load Tauri store: ${error}`,
		}),
})

const makeError = (method: string, key: string, error: unknown) =>
	new SystemError({
		reason: "Unknown",
		module: "KeyValueStore",
		method,
		pathOrDescriptor: key,
		description: `Tauri store ${method} failed: ${error}`,
	})

/**
 * Creates a KeyValueStore layer backed by Tauri's plugin-store
 */
export const layerTauriStore: Layer.Layer<KeyValueStore.KeyValueStore> = Layer.effect(
	KeyValueStore.KeyValueStore,
	Effect.gen(function* () {
		const store = yield* Effect.orDie(getStore)

		return KeyValueStore.makeStringOnly({
			get: (key: string) =>
				Effect.tryPromise({
					try: async () => {
						const value = await store.get<string>(key)
						return Option.fromNullable(value)
					},
					catch: (error) => makeError("get", key, error),
				}),

			set: (key: string, value: string) =>
				Effect.tryPromise({
					try: async () => {
						await store.set(key, value)
					},
					catch: (error) => makeError("set", key, error),
				}),

			remove: (key: string) =>
				Effect.tryPromise({
					try: async () => {
						await store.delete(key)
					},
					catch: (error) => makeError("remove", key, error),
				}),

			clear: Effect.tryPromise({
				try: async () => {
					await store.clear()
				},
				catch: (error) => makeError("clear", "all", error),
			}),

			size: Effect.tryPromise({
				try: async () => store.length(),
				catch: (error) => makeError("size", "length", error),
			}),

			has: (key: string) =>
				Effect.tryPromise({
					try: async () => {
						const value = await store.get<string>(key)
						return value !== null && value !== undefined
					},
					catch: (error) => makeError("has", key, error),
				}),
		})
	}),
)
