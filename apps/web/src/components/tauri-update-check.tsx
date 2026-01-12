import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { isTauri } from "~/lib/tauri"

/**
 * Component that checks for Tauri app updates and displays a toast notification
 * when an update is available, prompting the user to install and restart.
 *
 * Features:
 * - Checks for updates on mount and every 30 minutes
 * - Shows toast with version info and release notes
 * - Downloads and installs update, then relaunches the app
 * - Only runs in Tauri environment (no-op in browser)
 */
export const TauriUpdateCheck = () => {
	const checkingRef = useRef(false)

	useEffect(() => {
		if (!isTauri()) return

		const checkForUpdates = async () => {
			if (checkingRef.current) return
			checkingRef.current = true

			try {
				const { check } = await import("@tauri-apps/plugin-updater")
				const { relaunch } = await import("@tauri-apps/plugin-process")

				const update = await check()
				if (update) {
					toast(`Update available: v${update.version}`, {
						id: "tauri-update",
						description: update.body || "A new version is ready to install",
						duration: Number.POSITIVE_INFINITY,
						action: {
							label: "Install & Restart",
							onClick: async () => {
								toast.loading("Downloading update...", { id: "tauri-update" })
								await update.downloadAndInstall()
								await relaunch()
							},
						},
						cancel: {
							label: "Later",
							onClick: () => {},
						},
					})
				}
			} catch (error) {
				console.error("Update check failed:", error)
			} finally {
				checkingRef.current = false
			}
		}

		// Check on mount
		checkForUpdates()

		// Check every 30 minutes
		const interval = setInterval(checkForUpdates, 30 * 60 * 1000)
		return () => clearInterval(interval)
	}, [])

	return null
}
