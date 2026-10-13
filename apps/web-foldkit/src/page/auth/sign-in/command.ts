import { Effect, Schema } from "effect"
import { Command } from "foldkit"
import { Provider } from "../../../auth/client"
import { signInWithPasskey, startOAuthSignIn } from "../../../auth/flows"
import { load } from "foldkit/navigation"
import { runDesktopAuth } from "../../../platform/desktop-auth"
import { Message } from "./message"

const settle = <R>(flow: Effect.Effect<void, { readonly message: string | null }, R>) =>
	flow.pipe(
		Effect.as(Message.LeftForSignIn()),
		Effect.catch((error) => Effect.succeed(Message.FailedSignIn({ message: error.message }))),
	)

export const StartOAuthSignIn = Command.define("StartOAuthSignIn", {
	args: { provider: Schema.Literals(Provider), returnTo: Schema.NullOr(Schema.String) },
	messages: [Message.LeftForSignIn, Message.FailedSignIn],
	execute: ({ provider, returnTo }) => settle(startOAuthSignIn(provider, returnTo)),
})

export const StartPasskeySignIn = Command.define("StartPasskeySignIn", {
	args: { returnTo: Schema.NullOr(Schema.String) },
	messages: [Message.LeftForSignIn, Message.FailedSignIn],
	execute: ({ returnTo }) => settle(signInWithPasskey(returnTo)),
})

/** What a failed desktop sign-in tells the user (the library's `PlatformError` reasons). */
const browserFailure = (error: { readonly _tag: string; readonly reason?: string }): string =>
	error._tag === "BrowserLoginIndeterminate"
		? "Couldn't confirm the last sign-in. Restart Hazel and try again."
		: error.reason === "expired"
			? "Signing in took too long. Please try again."
			: error.reason === "busy"
				? "A sign-in is already in progress in your browser."
				: error._tag === "OperationHttpError"
					? "Couldn't reach Hazel. Check your connection and try again."
					: "Couldn't sign in through the browser. Please try again."

/**
 * Desktop: opens the browser at `/auth/desktop`, waits for its link back, then reloads into
 * the app with the new session. Interruptible, so Cancel can stop the wait.
 */
export const StartBrowserSignIn = Command.define("StartBrowserSignIn", {
	messages: [Message.LeftForSignIn, Message.FailedSignIn],
	interrupt: true,
	execute: runDesktopAuth((auth) => auth.signIn).pipe(
		Effect.andThen(load("/")),
		Effect.as(Message.LeftForSignIn()),
		Effect.catch((error) => Effect.succeed(Message.FailedSignIn({ message: browserFailure(error) }))),
	),
})

/** After Cancel stopped the wait: retires the attempt, so the next sign-in starts fresh. */
export const RetireBrowserSignIn = Command.define("RetireBrowserSignIn", {
	messages: [Message.CompletedRetireBrowserSignIn],
	execute: runDesktopAuth((auth) => auth.cancel).pipe(
		Effect.ignore,
		Effect.as(Message.CompletedRetireBrowserSignIn()),
	),
})
