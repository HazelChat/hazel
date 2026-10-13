import { Schema } from "effect"
import { Provider } from "../../../auth/client"

/** What the visitor started: a provider's OAuth redirect, the passkey prompt, or (desktop) the browser. */
export const Pending = Schema.NullOr(
	Schema.Union([Schema.Literals(Provider), Schema.Literals(["passkey", "browser"])]),
)
export type Pending = typeof Pending.Type

export const Model = Schema.Struct({
	/** `/sign-up` shows the same choices: the first OAuth sign-in creates the account. */
	mode: Schema.Literals(["SignIn", "SignUp"]),
	/** `?redirect_url=`: where to go once signed in. */
	redirectUrl: Schema.NullOr(Schema.String),
	pending: Pending,
	error: Schema.NullOr(Schema.String),
})
export type Model = typeof Model.Type
