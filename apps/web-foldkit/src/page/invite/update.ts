import { modifyFields } from "foldkit/struct"
import type { RouteOf } from "../../route"
import type { PageReturn } from "../contract"
import { PageOutMessage } from "../out-message"
import { AcceptInvitation, FetchPreview, RedirectToSignIn } from "./command"
import { Message } from "./message"
import { Lookup, type Model } from "./model"

type Return = PageReturn<Model, Message>

export const init = (route: RouteOf<"Invite">): Return => ({
	model: { token: route.token, lookup: Lookup.Loading(), isAccepting: false, error: null },
	commands: [FetchPreview({ token: route.token })],
})

export const update = (model: Model, message: Message): Return =>
	Message.match<Return>(message, {
		SucceededFetchPreview: ({ preview }) => ({
			model: modifyFields(model, { lookup: () => Lookup.Loaded({ preview }) }),
		}),
		FailedFetchPreview: ({ isNotFound }) => ({
			model: modifyFields(model, { lookup: () => (isNotFound ? Lookup.NotFound() : Lookup.Failed()) }),
		}),
		ClickedSignIn: () => ({ model, commands: [RedirectToSignIn({ token: model.token })] }),
		ClickedAccept: () =>
			model.isAccepting
				? { model }
				: {
						model: modifyFields(model, { isAccepting: () => true, error: () => null }),
						commands: [AcceptInvitation({ token: model.token })],
					},
		ClickedSignOut: () => ({ model, outMessage: PageOutMessage.RequestedSignOut() }),
		LeftPage: () => ({ model }),
		FailedAccept: ({ error }) => ({
			model: modifyFields(model, { isAccepting: () => false, error: () => error }),
		}),
	})
