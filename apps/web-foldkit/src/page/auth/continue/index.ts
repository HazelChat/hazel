import { Effect, Option, Schema } from "effect"
import { Command, Submodel } from "foldkit"
import { isProvider, Provider } from "../../../auth/client"
import { startOAuthSignIn } from "../../../auth/flows"
import type { RouteOf } from "../../../route"
import { loader } from "../../../ui/loader"
import { definePage, type PageReturn, type PageViewInputs } from "../../contract"
import { authError, authFrame, authHeading, signInLink } from "../layout"
import { Message } from "./message"
import { Model } from "./model"

/**
 * `/auth/continue?provider=`: the OAuth callback just linked this provider account to an
 * existing Hazel account (same verified email), so signing in once more lands in it.
 */

type Return = PageReturn<Model, Message>

const ContinueSignIn = Command.define("ContinueSignIn", {
	args: { provider: Schema.Literals(Provider) },
	messages: [Message.LeftForProvider, Message.FailedSignIn],
	// The page the visitor started from is still remembered from the first attempt.
	execute: ({ provider }) =>
		startOAuthSignIn(provider, null).pipe(
			Effect.as(Message.LeftForProvider()),
			Effect.catch((error) => Effect.succeed(Message.FailedSignIn({ message: error.message }))),
		),
})

const init = (route: RouteOf<"AuthContinue">): Return => {
	const provider = Option.getOrNull(route.provider)
	return provider !== null && isProvider(provider)
		? { model: { provider, error: null }, commands: [ContinueSignIn({ provider })] }
		: { model: { provider: null, error: null } }
}

const update = (model: Model, message: Message): Return =>
	Message.match<Return>(message, {
		LeftForProvider: () => ({ model }),
		FailedSignIn: ({ message }) => ({
			model: { ...model, error: message ?? "Something went wrong signing you in. Please try again." },
		}),
	})

const view = Submodel.defineView<Model, Message, PageViewInputs>((model, { shared }, h) =>
	authFrame(
		h,
		shared.nowMs,
		model.provider === null || model.error !== null
			? [
					authHeading(h, "Couldn't finish signing in", "Start again and pick the same account."),
					authError(h, model.error),
					h.p([h.Class("mt-4")], [signInLink(h, "Back to sign in")]),
				]
			: [
					authHeading(h, "Your accounts are linked", "Finishing sign-in..."),
					loader(h, { className: "size-6" }),
				],
	),
)

export const page = definePage(
	"AuthContinue",
	{ Model, Message },
	{ routes: ["AuthContinue"], init, update, view },
)
