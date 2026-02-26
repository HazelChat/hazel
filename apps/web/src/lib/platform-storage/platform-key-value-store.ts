/**
 * @module PlatformKeyValueStore
 * @description Unified KeyValueStore that auto-selects backend based on platform
 *
 * - Desktop runtime: Uses desktop bridge store (settings.json)
 * - Browser: Uses localStorage
 */

import { BrowserKeyValueStore } from "@effect/platform-browser"
import type * as KeyValueStore from "@effect/platform/KeyValueStore"
import type { Layer } from "effect"
import { isDesktopRuntime } from "~/lib/desktop-runtime"
import { layerDesktopStore } from "./desktop-key-value-store"

/**
 * Platform-aware KeyValueStore layer
 *
 * This layer is evaluated at module load time based on platform detection.
 */
export const layer: Layer.Layer<KeyValueStore.KeyValueStore> = isDesktopRuntime()
	? layerDesktopStore
	: BrowserKeyValueStore.layerLocalStorage
