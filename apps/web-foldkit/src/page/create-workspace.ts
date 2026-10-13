import { Effect, Exit, Schema } from "effect"
import { Command } from "foldkit"
import type { Html, HtmlBuilder } from "foldkit/html"
import { defineMessageUnion } from "foldkit/message"
import { load } from "foldkit/navigation"
import { modifyFields } from "foldkit/struct"
import { HazelRpc } from "../rpc"
import { button } from "../ui/button"
import { loader } from "../ui/loader"
import { textField } from "../ui/text-field"
import type { PageReturn } from "./contract"

/**
 * The "create your workspace" form shown to a user with no organization (onboarding's setup
 * step and the empty organization picker). Creating it makes the user its owner; the app then
 * reloads `/`, which carries on to onboarding or the new workspace.
 */

export const Model = Schema.Struct({
	name: Schema.String,
	slug: Schema.String,
	/** Once the slug is edited by hand it stops following the name. */
	isSlugEdited: Schema.Boolean,
	hasSubmitted: Schema.Boolean,
	isSubmitting: Schema.Boolean,
	error: Schema.NullOr(Schema.String),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
	ChangedName: { value: Schema.String },
	ChangedSlug: { value: Schema.String },
	SubmittedWorkspace: {},
	LeftForWorkspace: {},
	FailedCreateWorkspace: { error: Schema.String },
})
export type Message = typeof Message.Type

export const init = (): Model => ({
	name: "",
	slug: "",
	isSlugEdited: false,
	hasSubmitted: false,
	isSubmitting: false,
	error: null,
})

/** `Acme Corp!` → `acme-corp`. */
export const slugify = (value: string) =>
	value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 48)

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

export const nameError = (model: Model) =>
	model.name.trim().length >= 2 ? null : "Enter a name with at least 2 characters"

export const slugError = (model: Model) =>
	model.slug.length >= 3 && SLUG_PATTERN.test(model.slug)
		? null
		: "Use at least 3 lowercase letters, numbers or hyphens"

export const CreateWorkspace = Command.define("CreateWorkspace", {
	args: { name: Schema.String, slug: Schema.String },
	messages: [Message.LeftForWorkspace, Message.FailedCreateWorkspace],
	execute: ({ name, slug }) =>
		Effect.gen(function* () {
			const client = yield* HazelRpc
			const exit = yield* Effect.exit(
				client("organization.create", { name, slug, logoUrl: null, settings: null, isPublic: false }),
			)
			if (Exit.isSuccess(exit)) {
				// A full load, so user.me and the membership queries start from the new workspace.
				yield* load("/")
				return Message.LeftForWorkspace()
			}
			const isSlugTaken = exit.cause.reasons.some(
				(reason) => "error" in reason && reason.error._tag === "OrganizationSlugAlreadyExistsError",
			)
			return Message.FailedCreateWorkspace({
				error: isSlugTaken
					? "That workspace URL is taken. Pick another."
					: "Couldn't create the workspace. Please try again.",
			})
		}),
})

type Return = PageReturn<Model, Message>

export const update = (model: Model, message: Message): Return =>
	Message.match<Return>(message, {
		ChangedName: ({ value }) => ({
			model: modifyFields(model, {
				name: () => value,
				slug: () => (model.isSlugEdited ? model.slug : slugify(value)),
			}),
		}),
		ChangedSlug: ({ value }) => ({
			model: modifyFields(model, { slug: () => value.toLowerCase(), isSlugEdited: () => true }),
		}),
		SubmittedWorkspace: () => {
			const submitted = modifyFields(model, { hasSubmitted: () => true, error: () => null })
			if (model.isSubmitting || nameError(model) !== null || slugError(model) !== null)
				return { model: submitted }
			return {
				model: modifyFields(submitted, { isSubmitting: () => true }),
				commands: [CreateWorkspace({ name: model.name.trim(), slug: model.slug })],
			}
		},
		LeftForWorkspace: () => ({ model }),
		FailedCreateWorkspace: ({ error }) => ({
			model: modifyFields(model, { isSubmitting: () => false, error: () => error }),
		}),
	})

export const view = <ParentMessage>(
	h: HtmlBuilder<ParentMessage>,
	model: Model,
	toParent: (message: Message) => ParentMessage,
): Html => {
	const nameInvalid = model.hasSubmitted ? nameError(model) : null
	const slugInvalid = model.hasSubmitted ? slugError(model) : null
	return h.form(
		[h.Class("flex w-full flex-col gap-4"), h.OnSubmit(toParent(Message.SubmittedWorkspace()))],
		[
			textField(
				h,
				{
					id: "create-workspace-name",
					value: model.name,
					isRequired: true,
					isInvalid: nameInvalid !== null,
					onInput: (value) => toParent(Message.ChangedName({ value })),
				},
				(field) => [
					field.label(["Workspace name"]),
					field.input({ placeholder: "Acme Corp", attributes: [h.Autofocus(true)] }),
					field.fieldError([nameInvalid ?? ""]),
				],
			),
			textField(
				h,
				{
					id: "create-workspace-slug",
					value: model.slug,
					isRequired: true,
					isInvalid: slugInvalid !== null,
					onInput: (value) => toParent(Message.ChangedSlug({ value })),
				},
				(field) => [
					field.label(["Workspace URL"]),
					field.input({ placeholder: "acme-corp" }),
					field.description([`app.hazel.sh/${model.slug || "acme-corp"}`]),
					field.fieldError([slugInvalid ?? ""]),
				],
			),
			...(model.error === null
				? []
				: [h.p([h.Class("text-danger text-sm"), h.Role("alert")], [model.error])]),
			button(
				h,
				{
					intent: "primary",
					className: "mt-2 w-full",
					isDisabled: model.isSubmitting,
					onPress: toParent(Message.SubmittedWorkspace()),
				},
				model.isSubmitting
					? [loader(h, { className: "size-4" }), "Creating workspace..."]
					: ["Create workspace"],
			),
		],
	)
}
