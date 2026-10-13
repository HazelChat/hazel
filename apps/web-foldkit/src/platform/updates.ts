import { getTauriProcess, getTauriUpdater, type TauriUpdaterApi } from "@hazel/desktop/bridge"
import { Duration, Effect, Queue, Schema, Stream } from "effect"
import { Command, Subscription, type Update } from "foldkit"
import { defineMessageUnion } from "foldkit/message"
import { defineTaggedUnion } from "foldkit/schema"
import { isDesktop } from "./desktop"

/**
 * Desktop app updates (legacy `tauri-update-atoms.ts` and `TauriUpdateCheck`): a check at start
 * and every 6 hours, then download, install and relaunch on request. Web builds never check.
 */

type TauriUpdate = NonNullable<Awaited<ReturnType<TauriUpdaterApi["check"]>>>

/** The update `check` found. It is a live Tauri resource, so it stays out of the Model. */
let pendingUpdate: TauriUpdate | undefined

export const CHECK_INTERVAL = Duration.hours(6)

export const Model = defineTaggedUnion({
	Idle: {},
	Checking: {},
	Available: { version: Schema.String, body: Schema.NullOr(Schema.String) },
	UpToDate: { checkedAtMs: Schema.Number },
	CheckFailed: { message: Schema.String },
	Downloading: { downloadedBytes: Schema.Number, totalBytes: Schema.NullOr(Schema.Number) },
	Installing: {},
	Restarting: {},
	InstallFailed: { message: Schema.String },
})
export type Model = typeof Model.Type

export const init = (): Model => Model.Idle()

export const Message = defineMessageUnion({
	TickedUpdateCheck: {},
	FoundUpdate: { version: Schema.String, body: Schema.NullOr(Schema.String) },
	FoundNoUpdate: { checkedAtMs: Schema.Number },
	FailedUpdateCheck: { message: Schema.String },
	ProgressedDownload: { downloadedBytes: Schema.Number, totalBytes: Schema.NullOr(Schema.Number) },
	StartedInstall: {},
	StartedRelaunch: {},
	FailedInstall: { message: Schema.String },
})
export type Message = typeof Message.Type

const messageOf = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback)

export const CheckForUpdate = Command.define("CheckForUpdate", {
	messages: [Message.FoundUpdate, Message.FoundNoUpdate, Message.FailedUpdateCheck],
	execute: Effect.suspend(() => {
		const updater = getTauriUpdater()
		if (updater === undefined) return Effect.succeed(Message.FoundNoUpdate({ checkedAtMs: Date.now() }))
		return Effect.tryPromise(() => updater.check()).pipe(
			Effect.map((update) => {
				pendingUpdate = update ?? undefined
				return update
					? Message.FoundUpdate({ version: update.version, body: update.body ?? null })
					: Message.FoundNoUpdate({ checkedAtMs: Date.now() })
			}),
			Effect.catch((error) =>
				Effect.succeed(
					Message.FailedUpdateCheck({ message: messageOf(error.cause, "Update check failed") }),
				),
			),
		)
	}),
})

const isBusy = (model: Model) =>
	model._tag === "Checking" ||
	model._tag === "Downloading" ||
	model._tag === "Installing" ||
	model._tag === "Restarting"

/** Whether an update is being downloaded or installed: the install stream runs while this holds. */
export const isInstalling = (model: Model) =>
	model._tag === "Downloading" || model._tag === "Installing" || model._tag === "Restarting"

type Return = Update.Return<Model, Message>

/** Check now (the menu item, the settings button, the timer); ignored while busy. */
export const check = (model: Model): Return =>
	isBusy(model) ? { model } : { model: Model.Checking(), commands: [CheckForUpdate()] }

/** Install the update `check` found; the install stream starts once the state says Downloading. */
export const install = (model: Model): Return =>
	model._tag === "Available"
		? { model: Model.Downloading({ downloadedBytes: 0, totalBytes: null }) }
		: { model }

export const update = (model: Model, message: Message): Return =>
	Message.match<Return>(message, {
		TickedUpdateCheck: () => check(model),
		FoundUpdate: ({ version, body }) => ({ model: Model.Available({ version, body }) }),
		FoundNoUpdate: ({ checkedAtMs }) => ({ model: Model.UpToDate({ checkedAtMs }) }),
		FailedUpdateCheck: ({ message }) => ({ model: Model.CheckFailed({ message }) }),
		ProgressedDownload: ({ downloadedBytes, totalBytes }) => ({
			model: Model.Downloading({ downloadedBytes, totalBytes }),
		}),
		StartedInstall: () => ({ model: Model.Installing() }),
		StartedRelaunch: () => ({ model: Model.Restarting() }),
		FailedInstall: ({ message }) => ({ model: Model.InstallFailed({ message }) }),
	})

/** Download with progress, install, then relaunch (or quit, if relaunch fails). */
const installStream: Stream.Stream<Message> = Stream.callback<Message>((queue) =>
	Effect.gen(function* () {
		const update = pendingUpdate
		if (update === undefined) {
			Queue.offerUnsafe(queue, Message.FailedInstall({ message: "No update to install" }))
			return
		}
		let downloadedBytes = 0
		let totalBytes: number | null = null
		const fail = (message: string) =>
			Effect.sync(() => Queue.offerUnsafe(queue, Message.FailedInstall({ message })))

		const downloaded = yield* Effect.tryPromise(() =>
			update.download((event) => {
				if (event.event === "Started") totalBytes = event.data.contentLength ?? null
				if (event.event === "Progress") downloadedBytes += event.data.chunkLength
				Queue.offerUnsafe(queue, Message.ProgressedDownload({ downloadedBytes, totalBytes }))
			}),
		).pipe(Effect.result)
		if (downloaded._tag === "Failure")
			return yield* fail(messageOf(downloaded.failure.cause, "Download failed"))

		Queue.offerUnsafe(queue, Message.StartedInstall())
		const installed = yield* Effect.tryPromise(() => update.install()).pipe(Effect.result)
		if (installed._tag === "Failure")
			return yield* fail(messageOf(installed.failure.cause, "Installation failed"))

		Queue.offerUnsafe(queue, Message.StartedRelaunch())
		// Give the installer a moment to finish before restarting.
		yield* Effect.sleep(Duration.millis(500))
		const process = getTauriProcess()
		if (process === undefined)
			return yield* fail(
				"Update installed, but restart is unavailable. Please quit and reopen Hazel manually.",
			)
		const relaunched = yield* Effect.tryPromise(() => process.relaunch()).pipe(Effect.result)
		if (relaunched._tag === "Success") return
		const exited = yield* Effect.tryPromise(() => process.exit(0)).pipe(Effect.result)
		if (exited._tag === "Failure")
			yield* fail(
				"Update installed, but restart failed and Hazel could not quit automatically. Please quit and reopen Hazel manually.",
			)
	}).pipe(Effect.andThen(Effect.never)),
)

export const subscriptions = Subscription.make<Model, Message>()((entry) => ({
	// At start, then every 6 hours; never in the browser.
	periodicCheck: Subscription.persistentEntry(
		isDesktop
			? Stream.concat(Stream.succeed(undefined), Stream.tick(CHECK_INTERVAL)).pipe(
					Stream.map(() => Message.TickedUpdateCheck()),
				)
			: Stream.empty,
	),
	install: entry(
		{ isInstalling: Schema.Boolean },
		{
			modelToDependencies: (model) => ({ isInstalling: isInstalling(model) }),
			dependenciesToStream: ({ isInstalling }) => (isInstalling ? installStream : Stream.empty),
		},
	),
}))
