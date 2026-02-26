/**
 * @module PlatformStorage
 * @description Platform-aware storage utilities for Effect atoms
 *
 * Provides a unified KeyValueStore abstraction that works across:
 * - Browser: localStorage
 * - Desktop Runtime: Desktop bridge store (settings.json)
 */

export { layer } from "./platform-key-value-store"
export { platformStorageRuntime } from "./platform-runtime"
export { layerDesktopStore } from "./desktop-key-value-store"
