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

// Lazy store instance - cached after first load
let storeInstance: Awaited<ReturnType<typeof import("@tauri-apps/plugin-store").load>> | null = null

const getStore = Effect.tryPromise({
	try: async () => {
		if (!storeInstance) {
			const { load } = await import("@tauri-apps/plugin-store")
			storeInstance = await load(STORE_NAME, {
				autoSave: true,
				defaults: {},
			})
		}
		return storeInstance
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
