import * as PasskeyBrowser from "@yielded/auth-simplewebauthn/Browser"
import { Effect, Redacted, Schema } from "effect"
import { load } from "foldkit/navigation"
import { HazelAuthClient, type Provider } from "./client"
import { rememberReturnTo, takeReturnTo } from "./return-to"

/**
 * The sign-in flows the auth pages run: OAuth (leaves for the provider), passkeys and
 * registration (both end with a session cookie, then a full load so the app starts signed in).
 */

/** A flow that did not finish. `message` is `null` when the user cancelled it themselves. */
export class AuthFlowError extends Schema.TaggedError<AuthFlowError>()("AuthFlowError", {
	message: Schema.NullOr(Schema.String),
}) {}

/** User-facing text for a failed auth call, by the failure's tag. */
export const describeFailure = (tag: string): string | null => {
	if (tag === "PasskeyBrowserNotCompleted" || tag === "PasskeyBrowserBusy") return null
	if (tag === "PasskeyBrowserUnsupported" || tag === "PasskeyBrowserUnavailable")
		return "This browser can't use passkeys. Continue with GitHub or Google instead."
	if (tag === "OperationHttpError") return "Couldn't reach Hazel. Check your connection and try again."
	if (tag.endsWith("Rejected") || tag.endsWith("ActionRequired"))
		return "That sign-in expired or was already used. Please start again."
	if (tag.endsWith("Unavailable")) return "Sign-in is unavailable right now. Please try again in a moment."
	return "Something went wrong signing you in. Please try again."
}

const failed = (error: { readonly _tag: string }) =>
	new AuthFlowError({ message: describeFailure(error._tag) })

const newId = Effect.sync(() => crypto.randomUUID())

/** After a session is issued: a full load of the remembered page, so the app boots signed in. */
const enterApp = (returnTo: string | null) =>
	Effect.gen(function* () {
		const remembered = returnTo ?? (yield* takeReturnTo)
		yield* load(remembered ?? "/")
	})

/** Starts OAuth with `provider` and leaves for its consent screen. */
export const startOAuthSignIn = (provider: Provider, returnTo: string | null) =>
	Effect.gen(function* () {
		if (returnTo !== null) yield* rememberReturnTo(returnTo)
		const client = yield* HazelAuthClient
		const started = yield* client.auth
			.signIn({ provider, returnTarget: "/" })
			.pipe(Effect.mapError(failed))
		yield* load(Redacted.value(started.authorizationUrl))
	})

/** Begin, the browser's passkey prompt, complete; then into the app. */
export const signInWithPasskey = (returnTo: string | null) =>
	Effect.gen(function* () {
		const client = yield* HazelAuthClient
		const browser = yield* PasskeyBrowser.make()
		const started = yield* client.auth.passkeySignIn({
			flowId: yield* newId,
			commandId: yield* newId,
			profileId: "default",
		})
		const response = yield* browser.authenticate({ started, mediation: "required" })
		const result = yield* client.auth.completePasskeySignIn({
			flowId: response.flowId,
			response: Redacted.value(response.response),
		})
		if (result._tag !== "Authenticated") return yield* new AuthFlowError({ message: describeFailure("") })
		yield* enterApp(returnTo)
	}).pipe(
		Effect.catchIf(
			(error) => error._tag !== "AuthFlowError",
			(error) => Effect.fail(failed(error)),
		),
	)

export interface RegistrationInput {
	readonly flowId: string
	readonly reference: string
	readonly firstName: string
	readonly lastName: string
}

/** Creates the Hazel account for a verified provider identity; the API signs it in. */
export const register = (input: RegistrationInput) =>
	Effect.gen(function* () {
		const client = yield* HazelAuthClient
		const result = yield* client.auth.register({
			flowId: input.flowId,
			reference: input.reference,
			commandId: yield* newId,
			registration: { firstName: input.firstName.trim(), lastName: input.lastName.trim() },
		})
		if (result._tag !== "Authenticated") return yield* new AuthFlowError({ message: describeFailure("") })
		yield* enterApp(null)
	}).pipe(
		Effect.catchIf(
			(error) => error._tag !== "AuthFlowError",
			(error) => Effect.fail(failed(error)),
		),
	)
