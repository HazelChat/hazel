import { Schema } from "effect"
import { defineMessageUnion } from "foldkit/message"
import { Provider } from "../../../auth/client"

export const Message = defineMessageUnion({
	ClickedProvider: { provider: Schema.Literals(Provider) },
	ClickedPasskey: {},
	/** The browser is leaving for the provider or the app; nothing to render. */
	LeftForSignIn: {},
	/** `message` is `null` when the visitor cancelled the passkey prompt. */
	FailedSignIn: { message: Schema.NullOr(Schema.String) },
	/** Desktop: sign in through the system browser. */
	ClickedBrowserSignIn: {},
	ClickedCancelBrowserSignIn: {},
	CompletedCancelBrowserSignIn: {},
	CompletedRetireBrowserSignIn: {},
})
export type Message = typeof Message.Type
