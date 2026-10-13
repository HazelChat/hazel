import { Option } from "effect"
import { modifyFields } from "foldkit/struct"
import type { RouteOf } from "../../../route"
import type { PageReturn } from "../../contract"
import { Register } from "./command"
import { Message } from "./message"
import { isFirstNameMissing, type Model } from "./model"

type Return = PageReturn<Model, Message>

export const init = (route: RouteOf<"AuthRegister">): Return => ({
	model: {
		flowId: Option.getOrNull(route.flowId),
		reference: Option.getOrNull(route.reference),
		firstName: "",
		lastName: "",
		hasSubmitted: false,
		isSubmitting: false,
		error: null,
	},
})

const submit = (model: Model): Return => {
	const submitted = modifyFields(model, { hasSubmitted: () => true, error: () => null })
	if (model.isSubmitting || isFirstNameMissing(model) || model.flowId === null || model.reference === null)
		return { model: submitted }
	return {
		model: modifyFields(submitted, { isSubmitting: () => true }),
		commands: [
			Register({
				flowId: model.flowId,
				reference: model.reference,
				firstName: model.firstName,
				lastName: model.lastName,
			}),
		],
	}
}

export const update = (model: Model, message: Message): Return =>
	Message.match<Return>(message, {
		ChangedFirstName: ({ value }) => ({ model: modifyFields(model, { firstName: () => value }) }),
		ChangedLastName: ({ value }) => ({ model: modifyFields(model, { lastName: () => value }) }),
		SubmittedRegistration: () => submit(model),
		// Stays busy until the browser navigates away.
		LeftForApp: () => ({ model }),
		FailedRegistration: ({ message }) => ({
			model: modifyFields(model, { isSubmitting: () => false, error: () => message }),
		}),
	})
