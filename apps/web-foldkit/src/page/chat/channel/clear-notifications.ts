import { ChannelId } from "@hazel/schema"
import { Effect } from "effect"
import { Command } from "foldkit"
import { modifyFields } from "foldkit/struct"
import { catchCommon } from "../../../data/actions"
import { HazelRpc } from "../../../rpc"
import type { Shared } from "../../contract"
import { Message, type Model, type PageReturn } from "./model"

/** `ChatRouteContent`'s mount effect: clear the channel's notifications once per visit. */

export const ClearChannelNotifications = Command.define("ClearChannelNotifications", {
	args: { channelId: ChannelId },
	messages: [Message.SucceededClearNotifications, Message.FailedClearNotifications],
	execute: ({ channelId }) =>
		HazelRpc.use((rpc) => rpc("channelMember.clearNotifications", { channelId })).pipe(
			Effect.as(Message.SucceededClearNotifications({ channelId })),
			Effect.catchTags({
				ChannelNotFoundError: () =>
					Effect.succeed(
						Message.FailedClearNotifications({ channelId, reason: "ChannelNotFound" }),
					),
			}),
			catchCommon((reason) => Message.FailedClearNotifications({ channelId, reason })),
		),
})

/** The route content mounts inside the signed-in, loaded org layout (`_app` and `$orgSlug` gates). */
const isMounted = (shared: Shared) =>
	shared.auth === "SignedIn" && shared.currentUser !== null && shared.organization !== null

/** Sends the clear unless it is in flight or done; a failed clear is sent again on the next shared change. */
export const clearNotificationsOnMount = (model: Model, shared: Shared): PageReturn =>
	model.notificationsClear !== "NotSent" || !isMounted(shared)
		? { model }
		: {
				model: modifyFields(model, { notificationsClear: () => "Sending" }),
				commands: [ClearChannelNotifications({ channelId: model.channelId })],
			}
