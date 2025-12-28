import { AttachmentId, ChannelId, MessageId, UserId } from "@hazel/schema"
import { Schema } from "effect"
import { LiveObjectStatus, LiveObjectType } from "../live-state/types.ts"
import { MessageEmbeds } from "./message-embed-schema"
import * as M from "./utils"
import { baseFields } from "./utils"

export class Model extends M.Class<Model>("Message")({
	id: M.Generated(MessageId),
	channelId: ChannelId,
	authorId: M.GeneratedByApp(UserId),
	content: Schema.String,
	embeds: Schema.NullOr(MessageEmbeds),
	replyToMessageId: Schema.NullOr(MessageId),
	threadChannelId: Schema.NullOr(ChannelId),
	// Live object fields for streaming content
	liveObjectId: Schema.NullOr(Schema.String),
	liveObjectType: Schema.NullOr(LiveObjectType),
	liveObjectStatus: Schema.NullOr(LiveObjectStatus),
	...baseFields,
}) {}

// Custom insert schema that includes attachmentIds for linking
export const Insert = Schema.Struct({
	...Model.insert.fields,
	attachmentIds: Schema.optional(Schema.Array(AttachmentId)),
})

export const Update = Model.update

/**
 * Custom update schema for JSON API - only allows mutable fields.
 * Excludes immutable relationship fields (channelId, replyToMessageId, threadChannelId)
 * to prevent users from moving messages between channels or fabricating conversation context.
 */
export const JsonUpdate = Model.jsonUpdate.pipe(Schema.pick("content", "embeds"), Schema.partial)
