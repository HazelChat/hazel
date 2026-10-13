import { Option } from "effect"
import { modifyFields } from "foldkit/struct"
import { safeReturnTo } from "../../../auth/return-to"
import type { RouteOf } from "../../../route"
import type { PageReturn } from "../../contract"
import { StartOAuthSignIn, StartPasskeySignIn } from "./command"
import { Message } from "./message"
import type { Model } from "./model"

type Return = PageReturn<Model, Message>

export const init = (route: RouteOf<"SignIn" | "SignUp">): Return => ({
	model: {
		mode: route._tag,
		redirectUrl: safeReturnTo(Option.getOrNull(route.redirectUrl)),
		pending: null,
		error: null,
	},
})

export const update = (model: Model, message: Message): Return =>
	Message.match<Return>(message, {
		ClickedProvider: ({ provider }) =>
			model.pending !== null
				? { model }
				: {
						model: modifyFields(model, { pending: () => provider, error: () => null }),
						commands: [StartOAuthSignIn({ provider, returnTo: model.redirectUrl })],
					},
		ClickedPasskey: () =>
			model.pending !== null
				? { model }
				: {
						model: modifyFields(model, { pending: () => "passkey" as const, error: () => null }),
						commands: [StartPasskeySignIn({ returnTo: model.redirectUrl })],
					},
		// The page stays busy until the browser navigates away.
		LeftForSignIn: () => ({ model }),
		FailedSignIn: ({ message }) => ({
			model: modifyFields(model, { pending: () => null, error: () => message }),
		}),
	})
