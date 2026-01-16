/**
 * @module Tauri update checker component
 * @platform desktop
 * @description Check for app updates and prompt user to install (no-op in browser)
 */

import { useAtomMount, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import {
	createDownloadEffect,
	isTauriEnvironment,
	tauriDownloadStateAtom,
	tauriUpdateCheckAtom,
	tauriUpdateStateAtom,
} from "~/atoms/tauri-update-atoms"
import { runtime } from "~/lib/services/common/runtime"

/**
 * Component that checks for Tauri app updates and displays a toast notification
 * when an update is available, prompting the user to install and restart.
 *
 * Features:
 * - Checks for updates on mount and every 6 hours
 * - Shows toast with version info and release notes
 * - Downloads and installs update, then relaunches the app
 * - Only runs in Tauri environment (no-op in browser)
 */
export const TauriUpdateCheck = () => {
	// Mount the polling atom to start periodic update checks
	useAtomMount(tauriUpdateCheckAtom)

	// Subscribe to state
	const updateState = useAtomValue(tauriUpdateStateAtom)
	const downloadState = useAtomValue(tauriDownloadStateAtom)
	const setDownloadState = useAtomSet(tauriDownloadStateAtom)

	// Track whether we've shown the initial toast
	const hasShownToastRef = useRef(false)

	// Show toast when update becomes available
	useEffect(() => {
		if (!isTauriEnvironment) return

		if (updateState._tag === "available" && !hasShownToastRef.current) {
			hasShownToastRef.current = true
			const { update, version, body } = updateState

			toast(`Update available: v${version}`, {
				id: "tauri-update",
				description: body || "A new version is ready to install",
				duration: Number.POSITIVE_INFINITY,
				action: {
					label: "Install & Restart",
					onClick: () => {
						runtime.runPromise(createDownloadEffect(update, setDownloadState))
					},
				},
				cancel: {
					label: "Later",
					onClick: () => {},
				},
			})
		}

		// Reset toast tracking when state goes back to idle or not-available
		if (updateState._tag === "idle" || updateState._tag === "not-available") {
			hasShownToastRef.current = false
		}
	}, [updateState, setDownloadState])

	// Update toast based on download state
	useEffect(() => {
		if (!isTauriEnvironment) return

		switch (downloadState._tag) {
			case "downloading": {
				const { downloadedBytes, totalBytes } = downloadState
				if (totalBytes) {
					const percent = Math.round((downloadedBytes / totalBytes) * 100)
					toast.loading(`Downloading update... ${percent}%`, { id: "tauri-update" })
				} else {
					const mb = (downloadedBytes / 1024 / 1024).toFixed(1)
					toast.loading(`Downloading update... ${mb} MB`, { id: "tauri-update" })
				}
				break
			}
			case "installing":
				toast.loading("Installing update...", { id: "tauri-update" })
				break
			case "restarting":
				toast.loading("Restarting...", { id: "tauri-update" })
				break
			case "error":
				toast.error("Update failed", {
					id: "tauri-update",
					description: downloadState.message,
					duration: 10000,
				})
				break
		}
	}, [downloadState])

	return null
}
