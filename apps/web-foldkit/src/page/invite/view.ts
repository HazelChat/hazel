import { Submodel } from "foldkit"
import type { Html, HtmlBuilder } from "foldkit/html"
import { avatar } from "../../ui/avatar"
import { button } from "../../ui/button"
import { loader } from "../../ui/loader"
import { authError, authFrame, authHeading } from "../auth/layout"
import type { PageViewInputs, Shared } from "../contract"
import { Message } from "./message"
import type { Model, Preview } from "./model"

const initialsOf = (name: string) =>
	name
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase())
		.slice(0, 2)
		.join("")

const homeLink = (h: HtmlBuilder<Message>): Html =>
	h.a([h.Class("text-fg text-sm underline underline-offset-2"), h.Href("/")], ["Go to Hazel"])

const unavailable = (h: HtmlBuilder<Message>, title: string, description: string): ReadonlyArray<Html> => [
	authHeading(h, title, description),
	homeLink(h),
]

const statusMessage = (status: Preview["status"]) =>
	status === "Accepted"
		? "This invitation has already been used."
		: status === "Revoked"
			? "This invitation was withdrawn. Ask for a new one."
			: "This invitation has expired. Ask for a new one."

const isLoadingSession = (shared: Shared) =>
	shared.auth === "Loading" || (shared.auth === "SignedIn" && shared.currentUser === null)

const actions = (
	h: HtmlBuilder<Message>,
	model: Model,
	preview: Preview,
	shared: Shared,
): ReadonlyArray<Html> => {
	if (shared.currentUser === null)
		return [
			button(h, { intent: "primary", className: "w-full", onPress: Message.ClickedSignIn() }, [
				"Sign in to accept",
			]),
			h.p([h.Class("mt-3 text-muted-fg text-xs")], [`Use the account for ${preview.email}.`]),
		]
	if (shared.currentUser.email.toLowerCase() !== preview.email)
		return [
			h.p(
				[h.Class("text-muted-fg text-sm"), h.Role("alert")],
				[
					`This invitation is for ${preview.email}, but you're signed in as ${shared.currentUser.email}.`,
				],
			),
			button(h, { intent: "outline", className: "mt-4 w-full", onPress: Message.ClickedSignOut() }, [
				"Sign in with another account",
			]),
		]
	return [
		button(
			h,
			{
				intent: "primary",
				className: "w-full",
				isDisabled: model.isAccepting,
				onPress: Message.ClickedAccept(),
			},
			model.isAccepting ? [loader(h, { className: "size-4" }), "Joining..."] : ["Accept invitation"],
		),
	]
}

const invitation = (
	h: HtmlBuilder<Message>,
	model: Model,
	preview: Preview,
	shared: Shared,
): ReadonlyArray<Html> =>
	preview.status !== "Pending"
		? unavailable(h, "Invitation unavailable", statusMessage(preview.status))
		: [
				avatar(h, {
					src: preview.organizationLogoUrl,
					initials: initialsOf(preview.organizationName),
					size: "xl",
					className: "mb-6",
				}),
				authHeading(
					h,
					`Join ${preview.organizationName}`,
					"You've been invited to this workspace on Hazel.",
				),
				...actions(h, model, preview, shared),
				...[authError(h, model.error)].filter((html): html is Html => html !== null),
			]

export const view = Submodel.defineView<Model, Message, PageViewInputs>((model, { shared }, h) =>
	authFrame(
		h,
		shared.nowMs,
		model.lookup._tag === "Loading" || isLoadingSession(shared)
			? [loader(h, { className: "size-6" })]
			: model.lookup._tag === "Loaded"
				? invitation(h, model, model.lookup.preview, shared)
				: model.lookup._tag === "NotFound"
					? unavailable(
							h,
							"Invitation not found",
							"This link doesn't match an invitation. Check that it was copied in full.",
						)
					: unavailable(
							h,
							"Couldn't load the invitation",
							"Check your connection and reload the page.",
						),
	),
)
