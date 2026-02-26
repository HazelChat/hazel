/**
 * @module App version utilities
 * @description Get the app version for display in the UI
 */

import { useEffect, useState } from "react"
import { desktopBridge } from "./desktop-bridge"
import { isDesktopRuntime } from "./desktop-runtime"

/**
 * Hook to get the app version
 * - Web builds: Returns build-time injected version
 * - Desktop builds: Returns the installed app version via desktop bridge
 */
export function useAppVersion(): string | null {
	const [version, setVersion] = useState<string | null>(() => {
		if (typeof window === "undefined") return null
		if (!isDesktopRuntime()) return __APP_VERSION__
		return null
	})

	useEffect(() => {
		if (isDesktopRuntime()) {
			desktopBridge
				.getVersion()
				.then((result) => setVersion(result.version))
				.catch((error) => {
					console.error("[version] Failed to read desktop app version:", error)
				})
		}
	}, [])

	return version
}
