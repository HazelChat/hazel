import { ChannelId, MessageId, PinnedMessageId, UserId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, timestamptz, uuid } from "./columns"

export const pinnedMessagesTable = PG.table("pinned_messages", {
	columns: {
		id: PG.column(uuid(PinnedMessageId), { defaultExpr: "gen_random_uuid()" }),
		channelId: uuid(ChannelId),
		messageId: uuid(MessageId),
		pinnedBy: uuid(UserId),
		pinnedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("pinned_messages_channel_id_idx", ["channelId"]),
		PG.index("pinned_messages_message_id_idx", ["messageId"]),
		PG.uniqueIndex("pinned_messages_unique_idx", ["channelId", "messageId"]),
	],
})
export type PinnedMessage = PG.SelectRowOf<typeof pinnedMessagesTable>
export type NewPinnedMessage = PG.InsertRowOf<typeof pinnedMessagesTable>
