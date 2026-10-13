import { Option } from "effect"
import { Submodel } from "foldkit"
import type { Html, HtmlBuilder } from "foldkit/html"
import type { Provider } from "../../../auth/client"
import { IconLock } from "../../../icons"
import { AppRoute, hrefOf } from "../../../route"
import { button } from "../../../ui/button"
import { loader } from "../../../ui/loader"
import type { PageViewInputs } from "../../contract"
import { authError, authFrame, authHeading } from "../layout"
import { Message } from "./message"
import type { Model, Pending } from "./model"

const providers: ReadonlyArray<{ readonly id: Provider; readonly label: string; readonly domain: string }> = [
	{ id: "github", label: "GitHub", domain: "github.com" },
	{ id: "google", label: "Google", domain: "google.com" },
]

const brandIcon = (h: HtmlBuilder<Message>, domain: string, theme: "light" | "dark"): Html =>
	h.img([
		h.Attribute("src", `https://cdn.brandfetch.io/${domain}/w/64/h/64/theme/${theme}/icon`),
		h.Attribute("alt", ""),
		h.Class("size-4"),
	])

const choice = (
	h: HtmlBuilder<Message>,
	options: {
		readonly label: string
		readonly icon: Html
		readonly isPending: boolean
		readonly isDisabled: boolean
		readonly onPress: Message
	},
): Html =>
	button(
		h,
		{
			intent: "outline",
			className: "w-full",
			isDisabled: options.isDisabled,
			onPress: options.onPress,
		},
		[options.isPending ? loader(h, { className: "size-4" }) : options.icon, options.label],
	)

const divider = (h: HtmlBuilder<Message>): Html =>
	h.div(
		[h.Class("flex items-center gap-3 text-muted-fg text-xs")],
		[h.div([h.Class("h-px flex-1 bg-border")]), "or", h.div([h.Class("h-px flex-1 bg-border")])],
	)

const choices = (h: HtmlBuilder<Message>, pending: Pending, theme: "light" | "dark"): Html =>
	h.div(
		[h.Class("flex flex-col gap-3")],
		[
			...providers.map(({ id, label, domain }) =>
				choice(h, {
					label: `Continue with ${label}`,
					icon: brandIcon(h, domain, theme),
					isPending: pending === id,
					isDisabled: pending !== null,
					onPress: Message.ClickedProvider({ provider: id }),
				}),
			),
			divider(h),
			choice(h, {
				label: "Sign in with a passkey",
				icon: IconLock(h, { className: "size-4", attributes: { "aria-hidden": "true" } }),
				isPending: pending === "passkey",
				isDisabled: pending !== null,
				onPress: Message.ClickedPasskey(),
			}),
		],
	)

const switchLink = (h: HtmlBuilder<Message>, model: Model): Html => {
	const isSignIn = model.mode === "SignIn"
	const target = isSignIn ? AppRoute.SignUp : AppRoute.SignIn
	return h.p(
		[h.Class("mt-8 text-muted-fg text-sm")],
		[
			isSignIn ? "New to Hazel? " : "Already have an account? ",
			h.a(
				[
					h.Class("text-fg underline underline-offset-2"),
					h.Href(
						hrefOf(target({ splat: "", redirectUrl: Option.fromNullishOr(model.redirectUrl) })),
					),
				],
				[isSignIn ? "Create an account" : "Sign in"],
			),
		],
	)
}

export const view = Submodel.defineView<Model, Message, PageViewInputs>((model, { shared }, h) =>
	authFrame(h, shared.nowMs, [
		model.mode === "SignIn"
			? authHeading(h, "Sign in to Hazel", "Welcome back. Pick how you'd like to sign in.")
			: authHeading(
					h,
					"Create your Hazel account",
					"Sign up with GitHub or Google. It takes a few seconds.",
				),
		choices(h, model.pending, shared.theme.resolved),
		authError(h, model.error),
		switchLink(h, model),
	]),
)
