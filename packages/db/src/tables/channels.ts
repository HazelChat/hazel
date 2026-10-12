import {
	ChannelIcon,
	ChannelId,
	ChannelMemberId,
	ChannelSectionId,
	MessageId,
	OrganizationId,
	UserId,
} from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { now, pgEnum, timestamptz, uuid, varchar } from "./columns"

export const channelTypeEnum = pgEnum("channel_type", ["public", "private", "thread", "direct", "single"])

export const channelMembersTable = PG.table("channel_members", {
	columns: {
		id: PG.column(uuid(ChannelMemberId), { defaultExpr: "gen_random_uuid()" }),
		channelId: uuid(ChannelId),
		userId: uuid(UserId),
		isHidden: PG.column(PG.bool, { default: false }),
		isMuted: PG.column(PG.bool, { default: false }),
		isFavorite: PG.column(PG.bool, { default: false }),
		lastSeenMessageId: PG.nullable(uuid(MessageId)),
		notificationCount: PG.column(PG.int4, { default: 0 }),
		joinedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("channel_members_channel_id_idx", ["channelId"]),
		PG.index("channel_members_user_id_idx", ["userId"]),
		PG.index("channel_members_channel_user_idx", ["channelId", "userId"]),
	],
})
export type ChannelMember = PG.SelectRowOf<typeof channelMembersTable>
export type NewChannelMember = PG.InsertRowOf<typeof channelMembersTable>

export const channelsTable = PG.table("channels", {
	columns: {
		id: PG.column(uuid(ChannelId), { defaultExpr: "gen_random_uuid()" }),
		name: varchar(255),
		icon: PG.nullable(PG.brand(varchar(32), ChannelIcon)),
		type: channelTypeEnum,
		organizationId: uuid(OrganizationId),
		parentChannelId: PG.nullable(uuid(ChannelId)),
		sectionId: PG.nullable(uuid(ChannelSectionId)),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("channels_organization_id_idx", ["organizationId"]),
		PG.index("channels_parent_channel_id_idx", ["parentChannelId"]),
		PG.index("channels_section_id_idx", ["sectionId"]),
		PG.index("channels_type_idx", ["type"]),
		PG.index("channels_deleted_at_idx", ["deletedAt"]),
	],
})
export type Channel = PG.SelectRowOf<typeof channelsTable>
export type NewChannel = PG.InsertRowOf<typeof channelsTable>
