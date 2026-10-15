import { OrganizationId } from "@hazel/schema"
import { Effect, Schema } from "effect"
import { Command, Render } from "foldkit"
import * as Dom from "foldkit/dom"
import { HazelRpc } from "../../../rpc"
import { catchCommon } from "../../../data/actions"
import { Message } from "./model"

/** `AddConnectionModal`'s commands (`components/chat-sync/add-connection-modal.tsx`). */

export const ADD_CONNECTION_MODAL_ID = "chat-sync-add-connection"
export const GUILD_SEARCH_ID = `${ADD_CONNECTION_MODAL_ID}-search`

/** `createConnection` (`chatSync.connection.create`). */
export const CreateConnection = Command.define("CreateConnection", {
	args: {
		organizationId: OrganizationId,
		externalWorkspaceId: Schema.String,
		externalWorkspaceName: Schema.String,
	},
	messages: [Message.SucceededCreateConnection, Message.FailedCreateConnection],
	execute: ({ organizationId, externalWorkspaceId, externalWorkspaceName }) =>
		Effect.gen(function* () {
			// React paints the pending button on the click, before any reply; wait for that commit.
			yield* Render.afterCommit
			const client = yield* HazelRpc
			yield* client("chatSync.connection.create", {
				organizationId,
				provider: "discord",
				externalWorkspaceId,
				externalWorkspaceName,
			})
			return Message.SucceededCreateConnection()
		}).pipe(
			Effect.catchTags({
				ChatSyncConnectionExistsError: () =>
					Effect.succeed(Message.FailedCreateConnection({ reason: "AlreadyExists" })),
				ChatSyncIntegrationNotConnectedError: () =>
					Effect.succeed(Message.FailedCreateConnection({ reason: "DiscordNotConnected" })),
			}),
			catchCommon((reason) => Message.FailedCreateConnection({ reason })),
		),
})

/** The search Input's `autoFocus`, once it is rendered. */
export const FocusGuildSearch = Command.define("FocusGuildSearch", {
	messages: [Message.CompletedFocusGuildSearch],
	execute: Dom.focus(`#${GUILD_SEARCH_ID}`).pipe(
		Effect.ignoreCause,
		Effect.as(Message.CompletedFocusGuildSearch()),
	),
})
