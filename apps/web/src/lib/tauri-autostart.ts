/**
 * @module Desktop autostart functionality
 * @platform desktop
 * @description Enable/disable automatic app launch at system login
 */

import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart"
import { isTauri } from "./tauri"

export async function enableAutostart(): Promise<boolean> {
	if (!isTauri()) return false
	await enable()
	return true
}

export async function disableAutostart(): Promise<boolean> {
	if (!isTauri()) return false
	await disable()
	return true
}

export async function isAutostartEnabled(): Promise<boolean> {
	if (!isTauri()) return false
	return await isEnabled()
}
