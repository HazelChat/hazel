import { Schema } from "effect"
import type { Update } from "foldkit"
import type { Html, HtmlBuilder } from "foldkit/html"
import { modifyFields } from "foldkit/struct"
import * as Toast from "../ui/toast"
import * as ToastView from "../ui/toast-view"

/**
 * The root's toaster (legacy sonner `<Toaster>`): every page, modal and palette toast lands here
 * through `push`. Sonner ids are strings; the kit's are numbers, so the slot keeps the mapping.
 */

import { ToastAction, ToastRequest } from "./toasts"

export { ToastRequest }

export const Model = Schema.Struct({
	toaster: Toast.Model,
	/** Sonner id → the kit's numeric id of the toast it last showed. */
	idsByKey: Schema.Record(Schema.String, Schema.Number),
	/** The kit's numeric id → the action its button reports. */
	actionsById: Schema.Record(Schema.String, ToastAction),
})
export type Model = typeof Model.Type

export const Message = Toast.Message
export type Message = Toast.Message

export const init = (): Model => ({ toaster: Toast.init(), idsByKey: {}, actionsById: {} })

type Return = Update.Return<Model, Message>
type ReturnWithAction = Update.Return<Model, Message> & { readonly action?: ToastAction }

// UPDATE

/** `toast.success(title, { id, description })` and friends; a known `id` updates that toast in place. */
export const push = (model: Model, request: ToastRequest): Return => {
	const previousId = request.id === undefined ? undefined : model.idsByKey[request.id]
	const known = model.toaster.toasts.some((toast) => toast.id === previousId && !toast.isRemoved)
		? previousId
		: undefined
	const { kind, title, description } = Toast.fromIntentRequest(request)
	const extras = {
		actionLabel: request.action?.label ?? null,
		duration: request.isSticky ? Number.POSITIVE_INFINITY : 4000,
	}
	const shown =
		known === undefined
			? Toast.show(model.toaster, {
					kind,
					title,
					...(description === undefined ? {} : { description }),
					...extras,
				})
			: Toast.show(model.toaster, {
					id: known,
					kind,
					title,
					...(description === undefined ? {} : { description }),
					...extras,
				})
	return {
		model: modifyFields(model, {
			toaster: () => shown.model,
			idsByKey: (ids) => (request.id === undefined ? ids : { ...ids, [request.id]: shown.id }),
			actionsById: (actions) =>
				request.action === undefined
					? Object.fromEntries(Object.entries(actions).filter(([id]) => id !== String(shown.id)))
					: { ...actions, [String(shown.id)]: request.action.key },
		}),
		commands: shown.commands ?? [],
	}
}

/** The kit's `ClickedAction` becomes the toast's `action`, for the root to carry out. */
export const update = (model: Model, message: Message): ReturnWithAction => {
	const result = Toast.update(model.toaster, message)
	const next = {
		model: modifyFields(model, { toaster: () => result.model }),
		commands: result.commands ?? [],
	}
	const clicked = result.outMessage
	if (clicked === undefined || clicked._tag !== "ClickedAction") return next
	const action = model.actionsById[String(clicked.id)]
	return action === undefined ? next : { ...next, action }
}

// SUBSCRIPTION

export const subscriptions = Toast.subscriptions

// VIEW

/** Sonner's toaster section, the first child of `#app` where legacy renders `<Toaster>`. */
export const view = <ParentMessage>(
	h: HtmlBuilder<ParentMessage>,
	model: Model,
	theme: ToastView.ViewInputs["theme"],
	toParentMessage: (message: Message) => ParentMessage,
): Html =>
	h.submodel({
		slotId: "toaster",
		model: model.toaster,
		view: ToastView.view,
		viewInputs: { theme },
		toParentMessage,
	})
