import { Array, Effect, Option, Schema } from "effect"
import { Command } from "foldkit"
import { modifyFields } from "foldkit/struct"
import * as Menu from "../../../ui/menu"
import type { PageReturn } from "../../contract"
import { PageOutMessage } from "../../out-message"
import { errorToast, successToast } from "../../../data/actions"
import { InvitationId, OrganizationId } from "@hazel/schema"
import { listInvitations, revokeInvitation } from "../../../data/invitations"
import type { Shared } from "../../contract"
import { Message } from "./message"
import type { Invitation, Model, RowMenu } from "./model"

type Return = PageReturn<Model, Message>

export const REVOKE_KEY = "revoke"

// COMMAND

export const FetchInvitations = Command.define("FetchInvitations", {
	args: { organizationId: OrganizationId, version: Schema.Number },
	messages: [Message.CompletedFetchInvitations],
	execute: ({ organizationId, version }) =>
		listInvitations(organizationId).pipe(
			// The page shows the empty state when the list can't be loaded.
			Effect.orElseSucceed(() => []),
			Effect.map((invitations) => Message.CompletedFetchInvitations({ version, invitations })),
		),
})

export const RevokeInvitation = Command.define("RevokeInvitation", {
	args: { invitationId: InvitationId },
	messages: [Message.SucceededRevokeInvitation, Message.FailedRevokeInvitation],
	execute: ({ invitationId }) =>
		revokeInvitation(invitationId).pipe(
			Effect.match({
				onSuccess: () => Message.SucceededRevokeInvitation(),
				onFailure: () => Message.FailedRevokeInvitation(),
			}),
		),
})

// MENUS

export const rowMenuEntries = (isRevoking: boolean): ReadonlyArray<Menu.Entry> => [
	Menu.item(REVOKE_KEY, { intent: "Danger", isDisabled: isRevoking }),
]

/** One row menu per invitation, keeping open state for rows that stay. */
const reflectMenus = (menus: ReadonlyArray<RowMenu>, invitations: ReadonlyArray<Invitation>): ReadonlyArray<RowMenu> =>
	invitations.map((invitation) =>
		Option.getOrElse(
			Array.findFirst(menus, (row) => row.invitationId === invitation.id),
			() => ({
				invitationId: invitation.id,
				menu: Menu.init({ id: `invitation-${invitation.id}`, placement: "bottom end" }),
			}),
		),
	)

const withRevokingId = (model: Model, revokingId: InvitationId | null): Model =>
	modifyFields(model, { revokingId: () => revokingId })

// INIT

export const init = (_route: unknown, shared: Shared): Return => {
	const organizationId = shared.organization?.id ?? null
	return {
		model: { organizationId, invitations: [], fetchVersion: 1, menus: [], revokingId: null },
		commands: organizationId === null ? [] : [FetchInvitations({ organizationId, version: 1 })],
	}
}

// UPDATE

const updateRowMenu = (model: Model, invitationId: InvitationId, message: Menu.Message): Return =>
	Option.match(
		Array.findFirst(model.menus, (row) => row.invitationId === invitationId),
		{
			onNone: () => ({ model }),
			onSome: (row) => {
				const result = Menu.update(row.menu, message)
				const nextModel = modifyFields(model, {
					menus: Array.map((other) =>
						other.invitationId === invitationId ? { invitationId, menu: result.model } : other,
					),
				})
				const commands = Command.mapMessages(result.commands ?? [], (child) =>
					Message.GotRowMenuMessage({ invitationId, message: child }),
				)
				const isRevokeSelected = Option.exists(
					Option.fromNullishOr(result.outMessage),
					(out) => out._tag === "SelectedItem" && out.key === REVOKE_KEY,
				)
				return isRevokeSelected && model.revokingId === null
					? {
							model: withRevokingId(nextModel, invitationId),
							commands: [...commands, RevokeInvitation({ invitationId })],
						}
					: { model: nextModel, commands }
			},
		},
	)

const refetch = (model: Model): Return => {
	const version = model.fetchVersion + 1
	return {
		model: modifyFields(model, { fetchVersion: () => version }),
		commands:
			model.organizationId === null
				? []
				: [FetchInvitations({ organizationId: model.organizationId, version })],
	}
}

export const update = (model: Model, message: Message): Return =>
	Message.match<Return>(message, {
		CompletedFetchInvitations: ({ version, invitations }) =>
			version !== model.fetchVersion
				? { model }
				: {
						model: modifyFields(model, {
							invitations: () => invitations,
							menus: (menus) => reflectMenus(menus, invitations),
						}),
					},
		ClickedInviteUser: () => ({
			model,
			outMessage: PageOutMessage.RequestedModal({ modal: { _tag: "EmailInvite" } }),
		}),
		GotRowMenuMessage: ({ invitationId, message: child }) => updateRowMenu(model, invitationId, child),
		// The list is a one-off query, so it is fetched again after a revoke.
		SucceededRevokeInvitation: () => ({
			...refetch(withRevokingId(model, null)),
			outMessage: PageOutMessage.RequestedToast({
				toast: successToast("Invitation revoked successfully"),
			}),
		}),
		FailedRevokeInvitation: () => ({
			...refetch(withRevokingId(model, null)),
			outMessage: PageOutMessage.RequestedToast({ toast: errorToast("Failed to revoke invitation") }),
		}),
	})
