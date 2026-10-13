import { Submodel } from "foldkit"
import type { Html, HtmlBuilder } from "foldkit/html"
import { button } from "../../../ui/button"
import { loader } from "../../../ui/loader"
import { textField } from "../../../ui/text-field"
import type { PageViewInputs } from "../../contract"
import { authError, authFrame, authHeading, signInLink } from "../layout"
import { Message } from "./message"
import { isFirstNameMissing, type Model } from "./model"

const toFirstName = (value: string) => Message.ChangedFirstName({ value })
const toLastName = (value: string) => Message.ChangedLastName({ value })

const nameField = (
	h: HtmlBuilder<Message>,
	options: {
		readonly id: string
		readonly label: string
		readonly value: string
		readonly autocomplete: string
		readonly isRequired: boolean
		readonly error: string | null
		readonly isAutoFocused: boolean
		readonly onInput: (value: string) => Message
	},
): Html =>
	textField(
		h,
		{
			id: options.id,
			value: options.value,
			isRequired: options.isRequired,
			isInvalid: options.error !== null,
			onInput: options.onInput,
		},
		(parts) => [
			parts.label([options.label]),
			parts.input({
				attributes: [
					h.Attribute("autocomplete", options.autocomplete),
					...(options.isAutoFocused ? [h.Autofocus(true)] : []),
				],
			}),
			parts.fieldError([options.error ?? ""]),
		],
	)

const form = (h: HtmlBuilder<Message>, model: Model): Html =>
	h.form(
		[h.Class("flex flex-col gap-4"), h.OnSubmit(Message.SubmittedRegistration())],
		[
			nameField(h, {
				id: "register-first-name",
				label: "First name",
				value: model.firstName,
				autocomplete: "given-name",
				isRequired: true,
				error: model.hasSubmitted && isFirstNameMissing(model) ? "Enter your first name" : null,
				isAutoFocused: true,
				onInput: toFirstName,
			}),
			nameField(h, {
				id: "register-last-name",
				label: "Last name",
				value: model.lastName,
				autocomplete: "family-name",
				isRequired: false,
				error: null,
				isAutoFocused: false,
				onInput: toLastName,
			}),
			button(
				h,
				{
					intent: "primary",
					className: "mt-2 w-full",
					isDisabled: model.isSubmitting,
					onPress: Message.SubmittedRegistration(),
				},
				model.isSubmitting
					? [loader(h, { className: "size-4" }), "Creating your account..."]
					: ["Continue"],
			),
		],
	)

const brokenLink = (h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
	authHeading(
		h,
		"This sign-up link doesn't work",
		"It's missing details from your sign-in. Start again to continue.",
	),
	signInLink(h, "Back to sign in"),
]

export const view = Submodel.defineView<Model, Message, PageViewInputs>((model, { shared }, h) =>
	authFrame(
		h,
		shared.nowMs,
		model.flowId === null || model.reference === null
			? brokenLink(h)
			: [
					authHeading(h, "Welcome to Hazel", "What should your teammates call you?"),
					form(h, model),
					authError(h, model.error),
					...(model.error === null
						? []
						: [h.p([h.Class("mt-2")], [signInLink(h, "Start sign-in again")])]),
				],
	),
)
