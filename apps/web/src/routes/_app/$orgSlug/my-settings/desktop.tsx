/**
 * @module Desktop settings page
 * @platform desktop
 * @description User settings specific to the desktop application (autostart, etc.)
 */

import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
	checkForUpdates,
	createDownloadEffect,
	isTauriEnvironment,
	tauriDownloadStateAtom,
	tauriUpdateStateAtom,
	type TauriDownloadState,
	type TauriUpdateState,
} from "~/atoms/tauri-update-atoms"
import { IconCheck } from "~/components/icons/icon-check"
import { IconCube } from "~/components/icons/icon-cube"
import { IconDownload } from "~/components/icons/icon-download"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { ProgressBar, ProgressBarTrack } from "~/components/ui/progress-bar"
import { SectionHeader } from "~/components/ui/section-header"
import { SectionLabel } from "~/components/ui/section-label"
import { Switch, SwitchLabel } from "~/components/ui/switch"
import { runtime } from "~/lib/services/common/runtime"
import { disableAutostart, enableAutostart, isAutostartEnabled } from "~/lib/tauri-autostart"
import { useAppVersion } from "~/lib/version"

export const Route = createFileRoute("/_app/$orgSlug/my-settings/desktop")({
	component: DesktopSettings,
})

function DesktopSettings() {
	const [autostartEnabled, setAutostartEnabled] = useState<boolean | null>(null)

	// App version and update state
	const version = useAppVersion()
	const updateState = useAtomValue(tauriUpdateStateAtom)
	const downloadState = useAtomValue(tauriDownloadStateAtom)
	const setUpdateState = useAtomSet(tauriUpdateStateAtom)
	const setDownloadState = useAtomSet(tauriDownloadStateAtom)

	useEffect(() => {
		isAutostartEnabled()
			.then(setAutostartEnabled)
			.catch((error) => {
				console.error("[desktop-settings] Failed to check autostart status:", error)
				setAutostartEnabled(false)
			})
	}, [])

	const handleCheckForUpdates = () => {
		checkForUpdates(setUpdateState)
	}

	const handleInstallUpdate = () => {
		if (updateState._tag === "available") {
			runtime.runFork(createDownloadEffect(updateState.update, setDownloadState))
		}
	}

	const handleAutostartToggle = async (isSelected: boolean) => {
		try {
			if (isSelected) {
				await enableAutostart()
			} else {
				await disableAutostart()
			}
			setAutostartEnabled(isSelected)
		} catch (error) {
			console.error("[desktop-settings] Failed to toggle autostart:", error)
			// Revert to actual state on error
			const actualState = await isAutostartEnabled().catch(() => false)
			setAutostartEnabled(actualState)
		}
	}

	return (
		<form
			className="flex flex-col gap-6 px-4 lg:px-8"
			onSubmit={(e) => {
				e.preventDefault()
			}}
		>
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
						<SectionHeader.Heading>Desktop</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Settings for the desktop application.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<div className="flex flex-col gap-5">
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Launch at Startup"
						description="Automatically start the app when you log in."
					/>
					<div className="flex flex-col gap-4">
						<div className="rounded-lg border border-border bg-secondary/50 p-4">
							<Switch
								isSelected={autostartEnabled ?? false}
								isDisabled={autostartEnabled === null}
								onChange={handleAutostartToggle}
							>
								<SwitchLabel>Open at login</SwitchLabel>
							</Switch>
							<p className="mt-3 text-muted-fg text-sm">
								When enabled, the app will automatically launch when you log in to your
								computer.
							</p>
						</div>
					</div>
				</div>
			</div>

			{isTauriEnvironment && (
				<>
					<hr className="border-border" />

					<div className="flex flex-col gap-5">
						<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
							<SectionLabel.Root
								size="sm"
								title="App Updates"
								description="Check for and install app updates."
							/>
							<div className="flex flex-col gap-4">
								<div className="rounded-lg border border-border bg-secondary/50 p-4">
									<div className="flex flex-col gap-4">
										{/* Current version */}
										<div className="flex items-center gap-3">
											<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
												<IconCube className="size-5 text-muted-fg" />
											</div>
											<div className="flex flex-1 flex-col gap-0.5">
												<span className="text-sm text-muted-fg">Current version</span>
												<Badge intent="secondary" size="md" className="self-start">
													<span className="font-mono">
														{version ? `v${version}` : "..."}
													</span>
												</Badge>
											</div>
										</div>

										<hr className="border-border" />

										{/* Update status */}
										<UpdateStatusDisplay
											updateState={updateState}
											downloadState={downloadState}
											onCheckForUpdates={handleCheckForUpdates}
											onInstallUpdate={handleInstallUpdate}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</form>
	)
}

/**
 * Component to display update status and controls
 */
function UpdateStatusDisplay({
	updateState,
	downloadState,
	onCheckForUpdates,
	onInstallUpdate,
}: {
	updateState: TauriUpdateState
	downloadState: TauriDownloadState
	onCheckForUpdates: () => void
	onInstallUpdate: () => void
}) {
	// Handle download states first (they take priority when active)
	if (downloadState._tag !== "idle") {
		switch (downloadState._tag) {
			case "downloading": {
				const { downloadedBytes, totalBytes } = downloadState
				const percent = totalBytes ? Math.round((downloadedBytes / totalBytes) * 100) : 0
				const mbDownloaded = (downloadedBytes / 1024 / 1024).toFixed(1)
				const mbTotal = totalBytes ? (totalBytes / 1024 / 1024).toFixed(1) : null

				return (
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-fg">Downloading update...</span>
							<span className="font-medium">
								{mbTotal
									? `${mbDownloaded} / ${mbTotal} MB (${percent}%)`
									: `${mbDownloaded} MB`}
							</span>
						</div>
						<ProgressBar value={percent}>
							<ProgressBarTrack />
						</ProgressBar>
					</div>
				)
			}
			case "installing":
				return (
					<div className="flex items-center gap-2 text-sm text-muted-fg">
						<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
						<span>Installing update...</span>
					</div>
				)
			case "restarting":
				return (
					<div className="flex items-center gap-2 text-sm text-muted-fg">
						<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
						<span>Restarting...</span>
					</div>
				)
			case "error":
				return (
					<div className="flex flex-col gap-3">
						<p className="text-sm text-danger">{downloadState.message}</p>
						<Button intent="outline" size="sm" onPress={onCheckForUpdates}>
							Retry
						</Button>
					</div>
				)
		}
	}

	// Handle update states
	switch (updateState._tag) {
		case "idle":
			return (
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-fg">Check for available updates</span>
					<Button intent="outline" size="sm" onPress={onCheckForUpdates}>
						Check for updates
					</Button>
				</div>
			)
		case "checking":
			return (
				<div className="flex items-center gap-2 text-sm text-muted-fg">
					<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
					<span>Checking for updates...</span>
				</div>
			)
		case "available":
			return (
				<div className="flex flex-col gap-3">
					<div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
						<div className="flex items-center gap-3">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
								<IconDownload className="size-4 text-primary" />
							</div>
							<div className="flex flex-col gap-0.5">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-fg">Update available</span>
									<Badge intent="primary" size="sm">
										v{updateState.version}
									</Badge>
								</div>
								{updateState.body && (
									<p className="mt-1 text-sm text-muted-fg whitespace-pre-wrap">
										{updateState.body}
									</p>
								)}
							</div>
						</div>
					</div>
					<Button intent="primary" size="sm" onPress={onInstallUpdate}>
						Install & Restart
					</Button>
				</div>
			)
		case "not-available":
			return (
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/10">
							<IconCheck className="size-4 text-success" />
						</div>
						<div className="flex flex-col gap-0.5">
							<span className="text-sm font-medium text-fg">Up to date</span>
							<span className="text-xs text-muted-fg">
								Last checked: {updateState.lastCheckedAt.toLocaleTimeString()}
							</span>
						</div>
					</div>
					<Button intent="outline" size="sm" onPress={onCheckForUpdates}>
						Check again
					</Button>
				</div>
			)
		case "error":
			return (
				<div className="flex flex-col gap-3">
					<p className="text-sm text-danger">{updateState.message}</p>
					<Button intent="outline" size="sm" onPress={onCheckForUpdates}>
						Retry
					</Button>
				</div>
			)
	}
}
