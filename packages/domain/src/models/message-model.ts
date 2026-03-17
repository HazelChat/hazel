import { AttachmentId, ChannelId, ConnectConversationId, MessageId, UserId } from "@hazel/schema"
import { Schema as S } from "effect"
import { MessageEmbeds } from "./message-embed-schema"
import * as M from "./utils"
import { baseFields } from "./utils"

class Model extends M.Class<Model>("Message")({
	id: M.Generated(MessageId),
	channelId: ChannelId,
	conversationId: M.GeneratedOptional(S.NullOr(ConnectConversationId)),
	authorId: M.GeneratedByApp(UserId),
	content: S.String,
	embeds: S.NullOr(MessageEmbeds),
	replyToMessageId: S.NullOr(MessageId),
	threadChannelId: S.NullOr(ChannelId),
	...baseFields,
}) {}

// Custom insert schema that includes attachmentIds for linking
export const Insert = S.Struct({
	...M.structFields(Model.insert),
	conversationId: S.optional(S.NullOr(ConnectConversationId)),
	attachmentIds: S.optional(S.Array(AttachmentId)),
})

export const { Update, Schema } = M.expose(Model)

/**
 * Custom update schema for JSON API - only allows mutable fields.
 * Excludes immutable relationship fields (channelId, replyToMessageId, threadChannelId)
 * to prevent users from moving messages between channels or fabricating conversation context.
 */
const JsonUpdate = S.Struct({
	content: S.optionalKey(M.structFields(Model.jsonUpdate).content),
	embeds: S.optionalKey(M.structFields(Model.jsonUpdate).embeds),
})

export type Type = typeof Schema.Type

export const Create = S.Struct({
	...M.structFields(Model.jsonCreate),
	attachmentIds: S.optional(S.Array(AttachmentId)),
})

export const Patch = JsonUpdate
