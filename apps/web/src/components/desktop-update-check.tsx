/**
 * @module Desktop update checker component
 * @platform desktop
 * @description Check for app updates and prompt user to install (no-op in browser)
 */

import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import {
	checkForUpdates,
	desktopDownloadStateAtom,
	desktopUpdateStateAtom,
	isDesktopEnvironment,
	refreshUpdateStatusHistory,
	runDownloadEffect,
	subscribeToUpdaterStatus,
	UPDATE_CHECK_INTERVAL_MS,
} from "~/atoms/desktop-update-atoms"

export const DesktopUpdateCheck = () => {
	const setUpdateState = useAtomSet(desktopUpdateStateAtom)
	const setDownloadState = useAtomSet(desktopDownloadStateAtom)

	useEffect(() => {
		if (!isDesktopEnvironment) return

		checkForUpdates(setUpdateState)
		refreshUpdateStatusHistory(setDownloadState)

		const intervalId = setInterval(() => {
			checkForUpdates(setUpdateState)
		}, UPDATE_CHECK_INTERVAL_MS)

		const unsubscribe = subscribeToUpdaterStatus(setDownloadState)

		return () => {
			clearInterval(intervalId)
			unsubscribe()
		}
	}, [setUpdateState, setDownloadState])

	const updateState = useAtomValue(desktopUpdateStateAtom)
	const downloadState = useAtomValue(desktopDownloadStateAtom)

	const hasShownToastRef = useRef(false)

	useEffect(() => {
		if (!isDesktopEnvironment) return

		if (updateState._tag === "available" && !hasShownToastRef.current) {
			hasShownToastRef.current = true
			const { version, hash } = updateState

				toast(`Update available: v${version}`, {
					id: "desktop-update",
					description: `Build ${hash.slice(0, 8)} is ready to install`,
					duration: Number.POSITIVE_INFINITY,
					action: {
						label: "Install & Restart",
						onClick: () => {
							void runDownloadEffect(setDownloadState)
						},
					},
					cancel: {
						label: "Later",
						onClick: () => {},
					},
			})
		}

		if (updateState._tag === "idle") {
			hasShownToastRef.current = false
		}
	}, [updateState, setDownloadState])

	useEffect(() => {
		if (!isDesktopEnvironment) return

		switch (downloadState._tag) {
			case "downloading": {
				const { downloadedBytes, totalBytes } = downloadState
				if (totalBytes) {
					const percent = Math.round((downloadedBytes / totalBytes) * 100)
					toast.loading(`Downloading update... ${percent}%`, { id: "desktop-update" })
				} else {
					const mb = (downloadedBytes / 1024 / 1024).toFixed(1)
					toast.loading(`Downloading update... ${mb} MB`, { id: "desktop-update" })
				}
				break
			}
			case "installing":
				toast.loading("Installing update...", { id: "desktop-update" })
				break
			case "restarting":
				toast.loading("Restarting...", { id: "desktop-update" })
				break
			case "error":
				toast.error("Update failed", {
					id: "desktop-update",
					description: downloadState.message,
					duration: 10000,
				})
				break
		}
	}, [downloadState])

	return null
}
