/**
 * @module Desktop update atoms
 * @platform desktop
 * @description Effect Atom-based state management for desktop app updates.
 */

import { Atom } from "@effect-atom/atom-react"
import { Data, Duration, Effect } from "effect"
import { desktopBridge, type DesktopUpdaterStatus, onDesktopMessage } from "~/lib/desktop-bridge"
import { isDesktopRuntime } from "~/lib/desktop-runtime"

/**
 * Tagged error classes for update operations
 */
export class UpdateCheckError extends Data.TaggedError("UpdateCheckError")<{
	message: string
}> {}

export class UpdateDownloadError extends Data.TaggedError("UpdateDownloadError")<{
	message: string
}> {}

export class UpdateInstallError extends Data.TaggedError("UpdateInstallError")<{
	message: string
}> {}

export type DesktopUpdateState =
	| { _tag: "idle" }
	| { _tag: "checking" }
	| { _tag: "available"; version: string; hash: string; body: string | null }
	| { _tag: "not-available"; lastCheckedAt: Date }
	| { _tag: "error"; message: string }

export type DesktopDownloadState =
	| { _tag: "idle" }
	| { _tag: "downloading"; downloadedBytes: number; totalBytes: number | undefined }
	| { _tag: "installing" }
	| { _tag: "restarting" }
	| { _tag: "error"; message: string }

export const desktopUpdateStateAtom = Atom.make<DesktopUpdateState>({ _tag: "idle" }).pipe(Atom.keepAlive)

export const desktopDownloadStateAtom = Atom.make<DesktopDownloadState>({ _tag: "idle" }).pipe(Atom.keepAlive)

export const UPDATE_CHECK_INTERVAL_MS = Duration.toMillis(Duration.hours(6))

const toDownloadState = (entry: DesktopUpdaterStatus): DesktopDownloadState | null => {
	const bytesDownloaded = Number(entry.details?.bytesDownloaded ?? 0)
	const totalBytes = entry.details?.totalBytes
	const maybeTotal = typeof totalBytes === "number" ? totalBytes : undefined

	switch (entry.status) {
		case "download-starting":
		case "downloading":
		case "download-progress":
		case "downloading-patch":
		case "downloading-full-bundle":
			return {
				_tag: "downloading",
				downloadedBytes: Number.isFinite(bytesDownloaded) ? bytesDownloaded : 0,
				totalBytes: maybeTotal,
			}
		case "decompressing":
		case "extracting":
		case "applying":
		case "replacing-app":
			return { _tag: "installing" }
			case "launching-new-version":
				return { _tag: "restarting" }
			case "error": {
				const errorMessage = entry.details?.errorMessage
				return {
					_tag: "error",
					message:
						typeof errorMessage === "string" && errorMessage.length > 0 ? errorMessage : entry.message,
				}
			}
			default:
				return null
		}
	}

export const subscribeToUpdaterStatus = (
	setDownloadState: (state: DesktopDownloadState) => void,
): (() => void) => {
	return onDesktopMessage("updater.status", (entry) => {
		const state = toDownloadState(entry)
		if (state) {
			setDownloadState(state)
		}
	})
}

export async function checkForUpdates(setUpdateState: (state: DesktopUpdateState) => void): Promise<void> {
	if (!isDesktopRuntime()) return

	setUpdateState({ _tag: "checking" })

	try {
		const result = await desktopBridge.updaterCheck()

		if (result.updateAvailable) {
			setUpdateState({
				_tag: "available",
				version: result.version,
				hash: result.hash,
				body: null,
			})
		} else {
			setUpdateState({ _tag: "not-available", lastCheckedAt: new Date() })
		}
	} catch (error) {
		console.error("[desktop-update] Check failed:", error)
		setUpdateState({
			_tag: "error",
			message: error instanceof Error ? error.message : "Update check failed",
		})
	}
}

export const createDownloadEffect = (setDownloadState: (state: DesktopDownloadState) => void) =>
	Effect.gen(function* () {
		if (!isDesktopRuntime()) return

		yield* Effect.tryPromise({
			try: () => desktopBridge.ensureReady(),
			catch: (error) =>
				new UpdateDownloadError({
					message: String(error),
				}),
		})

		setDownloadState({ _tag: "downloading", downloadedBytes: 0, totalBytes: undefined })
		const download = yield* Effect.tryPromise({
			try: () => desktopBridge.updaterDownload(),
			catch: (error) =>
				new UpdateDownloadError({
					message: String(error),
				}),
		})

		if (!download.ok) {
			return yield* Effect.fail(
				new UpdateDownloadError({
					message: download.error ?? "Download failed",
				}),
			)
		}

		setDownloadState({ _tag: "installing" })
		yield* Effect.sleep(Duration.millis(250))

		const apply = yield* Effect.tryPromise({
			try: () => desktopBridge.updaterApply(),
			catch: (error) =>
				new UpdateInstallError({
					message: String(error),
				}),
		})

		if (!apply.ok) {
			return yield* Effect.fail(
				new UpdateInstallError({
					message: apply.error ?? "Installation failed",
				}),
			)
		}

		setDownloadState({ _tag: "restarting" })
		yield* Effect.sleep(Duration.millis(500))
	}).pipe(
		Effect.catchTags({
			UpdateDownloadError: (error) =>
				Effect.sync(() => {
					console.error("[desktop-update] Download failed:", error.message)
					setDownloadState({ _tag: "error", message: error.message })
				}),
			UpdateInstallError: (error) =>
				Effect.sync(() => {
					console.error("[desktop-update] Install failed:", error.message)
					setDownloadState({ _tag: "error", message: error.message })
				}),
		}),
	)

export const isDesktopEnvironment = isDesktopRuntime()

export const refreshUpdateStatusHistory = async (
	setDownloadState: (state: DesktopDownloadState) => void,
): Promise<void> => {
	if (!isDesktopRuntime()) return
	try {
		const { entries } = await desktopBridge.updaterGetStatus()
		const latest = entries[entries.length - 1]
		if (!latest) return
		const state = toDownloadState(latest)
		if (state) {
			setDownloadState(state)
		}
	} catch (error) {
		console.error("[desktop-update] Failed to read updater status history:", error)
	}
}

export const runDownloadEffect = (
	setDownloadState: (state: DesktopDownloadState) => void,
): Promise<void> => Effect.runPromise(createDownloadEffect(setDownloadState))
