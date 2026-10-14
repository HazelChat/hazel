/**
 * @module PlatformStorage
 * @description Platform-aware storage utilities for Effect atoms
 *
 * Provides a unified KeyValueStore abstraction that works across:
 * - Browser: localStorage
 * - Tauri Desktop: @tauri-apps/plugin-store (settings.json)
 */

export { layer } from "./platform-key-value-store"
export { platformStorageRuntime } from "./platform-runtime"
export { layerTauriStore } from "./tauri-key-value-store"
