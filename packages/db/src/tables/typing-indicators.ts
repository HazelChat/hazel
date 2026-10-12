import { ChannelId, ChannelMemberId, TypingIndicatorId } from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { uuid } from "./columns"

export const typingIndicatorsTable = PG.table("typing_indicators", {
	columns: {
		id: PG.column(uuid(TypingIndicatorId), { defaultExpr: "gen_random_uuid()" }),
		channelId: uuid(ChannelId),
		memberId: uuid(ChannelMemberId),
		lastTyped: PG.int8,
	},
	primaryKey: ["id"],
	indexes: [
		PG.uniqueIndex("typing_indicators_channel_member_unique", ["channelId", "memberId"]),
		PG.index("typing_indicators_channel_timestamp_idx", ["channelId", "lastTyped"]),
		PG.index("typing_indicators_timestamp_idx", ["lastTyped"]),
	],
})
export type TypingIndicator = PG.SelectRowOf<typeof typingIndicatorsTable>
export type NewTypingIndicator = PG.InsertRowOf<typeof typingIndicatorsTable>
