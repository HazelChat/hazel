import { Effect, Schema } from "effect"
import { Command } from "foldkit"
import { Provider } from "../../../auth/client"
import { signInWithPasskey, startOAuthSignIn } from "../../../auth/flows"
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
