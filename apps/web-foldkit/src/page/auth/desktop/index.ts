import { Effect, Option, Schema } from "effect"
import { Command, Submodel } from "foldkit"
import type { HtmlBuilder } from "foldkit/html"
import { defineMessageUnion } from "foldkit/message"
import { load } from "foldkit/navigation"
import { defineTaggedUnion } from "foldkit/schema"
import { modifyFields } from "foldkit/struct"
import { authorizeAttempt, describeAttempt } from "../../../auth/desktop-handoff"
import { AppRoute, hrefOf, signInHref, type RouteOf } from "../../../route"
import { button } from "../../../ui/button"
import { loader } from "../../../ui/loader"
import { definePage, type PageReturn, type PageViewInputs, type Shared } from "../../contract"
import { authError, authFrame, authHeading } from "../layout"

/**
 * `/auth/desktop?attempt=`: the desktop app opened this page to sign in. A signed-in browser
 * confirms the account; Hazel then hands the desktop app its own session through its link.
 */

const Step = defineTaggedUnion({
	Loading: {},
	Ready: { appName: Schema.String },
	Authorizing: { appName: Schema.String },
	/** The callback opened; kept for a manual "Open" link if the browser didn't follow it. */
	Returned: { callbackUrl: Schema.String },
	Failed: { message: Schema.String },
})

const Model = Schema.Struct({ attemptId: Schema.NullOr(Schema.String), step: Step })
type Model = typeof Model.Type

const Message = defineMessageUnion({
	DescribedAttempt: { appName: Schema.String },
	FailedDescribe: { message: Schema.String },
	ClickedContinue: {},
	ClickedSignIn: {},
	AuthorizedAttempt: { callbackUrl: Schema.String },
	FailedAuthorize: { message: Schema.String },
	LeftForSignIn: {},
})
type Message = typeof Message.Type

type Return = PageReturn<Model, Message>

export const DescribeAttempt = Command.define("DescribeAttempt", {
	args: { attemptId: Schema.String },
	messages: [Message.DescribedAttempt, Message.FailedDescribe],
	execute: ({ attemptId }) =>
		describeAttempt(attemptId).pipe(
			Effect.map((description) => Message.DescribedAttempt({ appName: description.displayName })),
			Effect.catch((error) => Effect.succeed(Message.FailedDescribe({ message: error.message }))),
		),
})

/** Authorizes, then opens the app's link (`hazel://…`); the OS hands it to the desktop app. */
export const AuthorizeAttempt = Command.define("AuthorizeAttempt", {
	args: { attemptId: Schema.String },
	messages: [Message.AuthorizedAttempt, Message.FailedAuthorize],
	execute: ({ attemptId }) =>
		authorizeAttempt(attemptId).pipe(
			Effect.tap((callbackUrl) => Effect.sync(() => window.location.assign(callbackUrl))),
			Effect.map((callbackUrl) => Message.AuthorizedAttempt({ callbackUrl })),
			Effect.catch((error) => Effect.succeed(Message.FailedAuthorize({ message: error.message }))),
		),
})

/** Sign in in this browser, then come back here (the attempt lives for five minutes). */
export const SignInFirst = Command.define("SignInForDesktop", {
	args: { returnTo: Schema.String },
	messages: [Message.LeftForSignIn],
	execute: ({ returnTo }) => load(signInHref(returnTo)).pipe(Effect.as(Message.LeftForSignIn())),
})

export const init = (route: RouteOf<"AuthDesktop">): Return => {
	const attemptId = Option.getOrNull(route.attempt)
	return attemptId === null
		? {
				model: {
					attemptId,
					step: Step.Failed({ message: "Open this page from the Hazel desktop app." }),
				},
			}
		: { model: { attemptId, step: Step.Loading() }, commands: [DescribeAttempt({ attemptId })] }
}

export const update = (model: Model, message: Message): Return =>
	Message.match<Return>(message, {
		DescribedAttempt: ({ appName }) => ({
			model: modifyFields(model, { step: () => Step.Ready({ appName }) }),
		}),
		FailedDescribe: ({ message }) => ({
			model: modifyFields(model, { step: () => Step.Failed({ message }) }),
		}),
		ClickedContinue: () => {
			const { step, attemptId } = model
			return step._tag !== "Ready" || attemptId === null
				? { model }
				: {
						model: modifyFields(model, {
							step: () => Step.Authorizing({ appName: step.appName }),
						}),
						commands: [AuthorizeAttempt({ attemptId })],
					}
		},
		ClickedSignIn: () =>
			model.attemptId === null
				? { model }
				: {
						model,
						commands: [
							SignInFirst({
								returnTo: hrefOf(
									AppRoute.AuthDesktop({ attempt: Option.some(model.attemptId) }),
								),
							}),
						],
					},
		AuthorizedAttempt: ({ callbackUrl }) => ({
			model: modifyFields(model, { step: () => Step.Returned({ callbackUrl }) }),
		}),
		// Authorizing is single use: a failure here means starting again from the app.
		FailedAuthorize: ({ message }) => ({
			model: modifyFields(model, { step: () => Step.Failed({ message }) }),
		}),
		LeftForSignIn: () => ({ model }),
	})

const isSessionLoading = (shared: Shared) =>
	shared.auth === "Loading" || (shared.auth === "SignedIn" && shared.currentUser === null)

const confirm = (h: HtmlBuilder<Message>, appName: string, shared: Shared, isAuthorizing: boolean) =>
	shared.currentUser === null
		? [
				authHeading(
					h,
					`Sign in to ${appName}`,
					"Sign in here in your browser; the app picks up from there.",
				),
				button(h, { intent: "primary", className: "w-full", onPress: Message.ClickedSignIn() }, [
					"Sign in",
				]),
			]
		: [
				authHeading(h, `Continue to ${appName}?`, `You're signed in as ${shared.currentUser.email}.`),
				button(
					h,
					{
						intent: "primary",
						className: "w-full",
						isDisabled: isAuthorizing,
						onPress: Message.ClickedContinue(),
					},
					isAuthorizing ? [loader(h, { className: "size-4" }), "Opening the app..."] : ["Continue"],
				),
				h.p(
					[h.Class("mt-3 text-muted-fg text-xs")],
					["Not you? Sign out of Hazel in this browser, then start again from the app."],
				),
			]

export const view = Submodel.defineView<Model, Message, PageViewInputs>((model, { shared }, h) =>
	authFrame(
		h,
		shared.nowMs,
		model.step._tag === "Loading" || isSessionLoading(shared)
			? [loader(h, { className: "size-6" })]
			: model.step._tag === "Ready"
				? confirm(h, model.step.appName, shared, false)
				: model.step._tag === "Authorizing"
					? confirm(h, model.step.appName, shared, true)
					: model.step._tag === "Returned"
						? [
								authHeading(
									h,
									"You're signed in",
									"Switch back to the Hazel app. You can close this tab.",
								),
								h.a(
									[
										h.Class("text-fg text-sm underline underline-offset-2"),
										h.Href(model.step.callbackUrl),
										h.Attribute("rel", "noreferrer"),
									],
									["Open Hazel"],
								),
							]
						: [
								authHeading(
									h,
									"Couldn't sign in the app",
									"Start signing in again from the Hazel desktop app.",
								),
								...[authError(h, model.step.message)].filter((html) => html !== null),
							],
	),
)

export const page = definePage(
	"AuthDesktop",
	{ Model, Message },
	{ routes: ["AuthDesktop"], init, update, view },
)
