import { Duration, Effect, Schedule, Schema } from "effect"
import { Command } from "foldkit"
import { load, pushUrl, replaceUrl } from "foldkit/navigation"
import { HazelRpc } from "../rpc"
import { applyTheme, ResolvedTheme, saveThemePreference, ThemeCustomization, ThemePreference } from "../theme"
import { saveSoundSettings, SoundSettings } from "../notification-sound"
import { deliverNotifications } from "./notification-sinks"
import { UnauthorizedError } from "@hazel/domain/errors"
import { NotificationId } from "@hazel/schema"
import { readSession, signOut } from "./auth"
import { Message } from "./message"

export const NavigateInternal = Command.define("NavigateInternal", {
	args: { url: Schema.String },
	messages: [Message.CompletedNavigateInternal],
	execute: ({ url }) => pushUrl(url).pipe(Effect.as(Message.CompletedNavigateInternal())),
})

/** Redirects replace the history entry, so Back never lands on a page that forwards again. */
export const ReplaceUrl = Command.define("ReplaceUrl", {
	args: { url: Schema.String },
	messages: [Message.CompletedReplaceUrl],
	execute: ({ url }) => replaceUrl(url).pipe(Effect.as(Message.CompletedReplaceUrl())),
})

export const LoadExternal = Command.define("LoadExternal", {
	args: { href: Schema.String },
	messages: [Message.CompletedLoadExternal],
	execute: ({ href }) => load(href).pipe(Effect.as(Message.CompletedLoadExternal())),
})

export const ApplyTheme = Command.define("ApplyTheme", {
	args: { resolved: ResolvedTheme, customization: ThemeCustomization },
	messages: [Message.CompletedApplyTheme],
	execute: ({ resolved, customization }) =>
		applyTheme(resolved, customization).pipe(Effect.as(Message.CompletedApplyTheme())),
})

export const SaveThemePreference = Command.define("SaveThemePreference", {
	args: { preference: ThemePreference },
	messages: [Message.CompletedSaveThemePreference],
	execute: ({ preference }) =>
		saveThemePreference(preference).pipe(Effect.as(Message.CompletedSaveThemePreference())),
})

export const SaveSoundSettings = Command.define("SaveSoundSettings", {
	args: { settings: SoundSettings },
	messages: [Message.CompletedSaveSoundSettings],
	execute: ({ settings }) => saveSoundSettings(settings).pipe(Effect.as(Message.CompletedSaveSoundSettings())),
})

/** `notificationOrchestrator.enqueue(events)`; it skips what it has already processed. */
export const DeliverNotifications = Command.define("DeliverNotifications", {
	args: { ids: Schema.Array(NotificationId) },
	messages: [Message.CompletedDeliverNotifications],
	execute: ({ ids }) => deliverNotifications(ids).pipe(Effect.as(Message.CompletedDeliverNotifications())),
})

/** How long the app waits before asking again after the API did not answer. */
const RETRY_DELAY = Duration.seconds(10)

const checkSession = readSession.pipe(
	Effect.map((auth) => Message.ChangedAuth({ auth })),
	Effect.orElseSucceed(() => Message.FailedCheckSession()),
)

/** Whether the API has a session for this browser. */
export const CheckSession = Command.define("CheckSession", {
	messages: [Message.ChangedAuth, Message.FailedCheckSession],
	execute: checkSession,
})

/** The session check again after a pause, while the API has not answered. */
export const RetryCheckSession = Command.define("RetryCheckSession", {
	messages: [Message.ChangedAuth, Message.FailedCheckSession],
	execute: Effect.sleep(RETRY_DELAY).pipe(Effect.andThen(checkSession)),
})

/** A full page load: every query, sync and token starts over. */
export const Reload = Command.define("Reload", {
	messages: [Message.CompletedReload],
	execute: Effect.sync(() => window.location.reload()).pipe(Effect.as(Message.CompletedReload())),
})

export const SignOut = Command.define("SignOut", {
	messages: [Message.CompletedSignOut, Message.FailedSignOut],
	execute: signOut.pipe(
		Effect.as(Message.CompletedSignOut()),
		Effect.catchTag("SignOutError", (error) =>
			Effect.succeed(Message.FailedSignOut({ reason: error.message })),
		),
	),
})

/** A failed `user.me` other than Unauthorized is retried this often before reporting failure. */
const retryCurrentUser = Schedule.exponential("500 millis").pipe(Schedule.jittered)

const fetchCurrentUser = Effect.gen(function* () {
	const client = yield* HazelRpc
	const user = yield* client("user.me", undefined).pipe(
		Effect.retry({
			schedule: retryCurrentUser,
			times: 3,
			while: (error) => !UnauthorizedError.is(error),
		}),
	)
	return Message.SucceededFetchCurrentUser({
		user: {
			id: user.id,
			firstName: user.firstName ?? "",
			lastName: user.lastName ?? "",
			email: user.email,
			avatarUrl: user.avatarUrl ?? null,
			isOnboarded: user.isOnboarded,
			organizationId: user.organizationId ?? null,
		},
	})
}).pipe(
	Effect.catch((error) =>
		Effect.succeed(
			Message.FailedFetchCurrentUser({
				reason: String(error),
				isUnauthorized: UnauthorizedError.is(error),
			}),
		),
	),
)

export const FetchCurrentUser = Command.define("FetchCurrentUser", {
	messages: [Message.SucceededFetchCurrentUser, Message.FailedFetchCurrentUser],
	execute: fetchCurrentUser,
})

/** `user.me` again after a pause, while the shell has a session but no user to show. */
export const RetryFetchCurrentUser = Command.define("RetryFetchCurrentUser", {
	messages: [Message.SucceededFetchCurrentUser, Message.FailedFetchCurrentUser],
	execute: Effect.sleep(RETRY_DELAY).pipe(Effect.andThen(fetchCurrentUser)),
})
