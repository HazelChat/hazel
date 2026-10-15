import { Option } from "effect"
import { Command } from "foldkit"
import * as CreateWorkspace from "../create-workspace"
import { modifyFields } from "foldkit/struct"
import { AppRoute, organizationRoute } from "../../route"
import type { PageReturn } from "../contract"
import { PageOutMessage } from "../out-message"
import { Message } from "./message"
import type { Model } from "./model"

type Return = PageReturn<Model, Message>

const navigate = (model: Model, route: AppRoute): Return => ({
	model,
	outMessage: PageOutMessage.RequestedNavigation({ route, replace: false }),
})

export const init = (): Return => ({
	model: { organizations: null, hasRedirected: false, createWorkspace: CreateWorkspace.init() },
})

export const update = (model: Model, message: Message): Return =>
	Message.match<Return>(message, {
		UpdatedOrganizations: ({ organizations }) => {
			const next = modifyFields(model, { organizations: () => organizations })
			const [single] = organizations
			// `<Navigate>` with a single organization: there is nothing to pick.
			return organizations.length === 1 && single && !model.hasRedirected
				? navigate(modifyFields(next, { hasRedirected: () => true }), organizationRoute(single))
				: { model: next }
		},
		ClickedOrganization: ({ organization }) => navigate(model, organizationRoute(organization)),
		ClickedCreateNew: () =>
			navigate(model, AppRoute.Onboarding({ orgId: Option.none(), step: Option.none() })),
		GotCreateWorkspaceMessage: ({ message: child }) => {
			const result = CreateWorkspace.update(model.createWorkspace, child)
			return {
				model: modifyFields(model, { createWorkspace: () => result.model }),
				commands: Command.mapMessages(result.commands, (message) =>
					Message.GotCreateWorkspaceMessage({ message }),
				),
			}
		},
	})
