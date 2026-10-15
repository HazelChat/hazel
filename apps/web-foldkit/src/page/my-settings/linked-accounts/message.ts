import { Schema } from "effect"
import { defineMessageUnion } from "foldkit/message"
import { CommonReason } from "~/lib/error-messages"
import * as Interaction from "../../../ui/aria/interaction"
import { DiscordConnection } from "./model"

/** Why `integrations.getOAuthUrl` failed, beyond the shared reasons. */
export const LinkFailure = Schema.Union([Schema.Literal("UnsupportedProvider"), CommonReason])
export type LinkFailure = typeof LinkFailure.Type

/** Why `integrations.disconnect` failed, beyond the shared reasons. */
export const UnlinkFailure = Schema.Union([
	Schema.Literals(["NotConnected", "UnsupportedProvider"]),
	CommonReason,
])
export type UnlinkFailure = typeof UnlinkFailure.Type

export const Message = defineMessageUnion({
	UpdatedDiscordConnection: { connection: Schema.NullOr(DiscordConnection) },
	ClickedLinkDiscord: {},
	SucceededGetDiscordOAuthUrl: {},
	FailedGetDiscordOAuthUrl: { reason: LinkFailure },
	ClickedUnlinkDiscord: {},
	SucceededDisconnectDiscord: {},
	FailedDisconnectDiscord: { reason: UnlinkFailure },
	GotInteractionMessage: { message: Interaction.Message },
})
export type Message = typeof Message.Type
