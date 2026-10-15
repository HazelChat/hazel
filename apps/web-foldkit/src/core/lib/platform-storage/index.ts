/**
 * @module PlatformStorage
 * @description Platform-aware key-value storage
 *
 * Provides a unified KeyValueStore abstraction that works across:
 * - Browser: localStorage
 * - Tauri Desktop: @tauri-apps/plugin-store (settings.json)
 */

export { layer } from "./platform-key-value-store"
export { layerTauriStore } from "./tauri-key-value-store"
