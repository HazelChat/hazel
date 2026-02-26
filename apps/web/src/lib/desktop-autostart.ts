/**
 * @module Desktop autostart functionality
 * @platform desktop
 * @description Launch-at-login is intentionally disabled for the first Electrobun release.
 */

const logDisabled = () => {
	console.info("[desktop-autostart] Launch at startup is disabled in this release")
}

export async function enableAutostart(): Promise<boolean> {
	logDisabled()
	return false
}

export async function disableAutostart(): Promise<boolean> {
	logDisabled()
	return false
}

export async function isAutostartEnabled(): Promise<boolean> {
	return false
}

export const isAutostartSupported = (): boolean => false
