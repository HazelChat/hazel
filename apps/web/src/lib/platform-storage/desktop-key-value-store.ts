/**
 * @module DesktopKeyValueStore
 * @platform desktop
 * @description Effect KeyValueStore implementation using desktop runtime store bridge.
 */

import * as KeyValueStore from "@effect/platform/KeyValueStore"
import { SystemError } from "@effect/platform/Error"
import { Effect, Layer, Option } from "effect"
import { desktopBridge } from "~/lib/desktop-bridge"

const STORE_NAME = "settings.json"

const makeError = (method: string, key: string, error: unknown) =>
	new SystemError({
		reason: "Unknown",
		module: "KeyValueStore",
		method,
		pathOrDescriptor: key,
		description: `Desktop store ${method} failed: ${error}`,
	})

export const layerDesktopStore: Layer.Layer<KeyValueStore.KeyValueStore> = Layer.effect(
	KeyValueStore.KeyValueStore,
	Effect.gen(function* () {
		return KeyValueStore.makeStringOnly({
			get: (key: string) =>
				Effect.tryPromise({
					try: async () => {
						const value = await desktopBridge.storeGet(STORE_NAME, key)
						return Option.fromNullable(value.value)
					},
					catch: (error) => makeError("get", key, error),
				}),

			set: (key: string, value: string) =>
				Effect.tryPromise({
					try: async () => {
						await desktopBridge.storeSet(STORE_NAME, key, value)
					},
					catch: (error) => makeError("set", key, error),
				}),

			remove: (key: string) =>
				Effect.tryPromise({
					try: async () => {
						await desktopBridge.storeDelete(STORE_NAME, key)
					},
					catch: (error) => makeError("remove", key, error),
				}),

			clear: Effect.tryPromise({
				try: async () => {
					await desktopBridge.storeClear(STORE_NAME)
				},
				catch: (error) => makeError("clear", "all", error),
			}),

			size: Effect.tryPromise({
				try: async () => (await desktopBridge.storeLength(STORE_NAME)).value,
				catch: (error) => makeError("size", "length", error),
			}),

			has: (key: string) =>
				Effect.tryPromise({
					try: async () => {
						const value = await desktopBridge.storeGet(STORE_NAME, key)
						return value.value !== null
					},
					catch: (error) => makeError("has", key, error),
				}),
		})
	}),
)
