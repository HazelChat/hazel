import {
	ChannelId,
	ConnectConversationChannelId,
	ConnectConversationId,
	ConnectInviteId,
	ConnectParticipantId,
	OrganizationId,
	UserId,
} from "@hazel/schema"
import * as PG from "@maple-dev/effect-orm/postgres"
import { jsonb, now, timestamptz, uuid, varchar } from "./columns"

export const connectConversationStatusEnum = PG.enumType("connect_conversation_status", [
	"active",
	"disconnected",
])
export const connectConversationChannelRoleEnum = PG.enumType("connect_conversation_channel_role", [
	"host",
	"guest",
])
export const connectInviteStatusEnum = PG.enumType("connect_invite_status", [
	"pending",
	"accepted",
	"declined",
	"revoked",
	"expired",
])
export const connectInviteTargetKindEnum = PG.enumType("connect_invite_target_kind", ["slug", "email"])

export const connectConversationChannelsTable = PG.table("connect_conversation_channels", {
	columns: {
		id: PG.column(uuid(ConnectConversationChannelId), { defaultExpr: "gen_random_uuid()" }),
		conversationId: uuid(ConnectConversationId),
		organizationId: uuid(OrganizationId),
		channelId: uuid(ChannelId),
		role: connectConversationChannelRoleEnum,
		allowGuestMemberAdds: PG.column(PG.bool, { default: false }),
		isActive: PG.column(PG.bool, { default: true }),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("connect_conv_channels_conversation_idx", ["conversationId"]),
		PG.index("connect_conv_channels_org_idx", ["organizationId"]),
		PG.index("connect_conv_channels_channel_idx", ["channelId"]),
		PG.index("connect_conv_channels_deleted_at_idx", ["deletedAt"]),
		PG.uniqueIndex("connect_conv_channels_channel_unique", ["channelId"], {
			where: '"deletedAt" IS NULL',
		}),
		PG.uniqueIndex(
			"connect_conv_channels_conversation_org_unique",
			["conversationId", "organizationId"],
			{ where: '"deletedAt" IS NULL' },
		),
	],
})
export type ConnectConversationChannel = PG.SelectRowOf<typeof connectConversationChannelsTable>
export type NewConnectConversationChannel = PG.InsertRowOf<typeof connectConversationChannelsTable>

export const connectConversationsTable = PG.table("connect_conversations", {
	columns: {
		id: PG.column(uuid(ConnectConversationId), { defaultExpr: "gen_random_uuid()" }),
		hostOrganizationId: uuid(OrganizationId),
		hostChannelId: uuid(ChannelId),
		status: PG.column(connectConversationStatusEnum, { default: "active" }),
		settings: PG.nullable(jsonb<Record<string, unknown>>()),
		createdBy: uuid(UserId),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("connect_conversations_host_org_idx", ["hostOrganizationId"]),
		PG.index("connect_conversations_host_channel_idx", ["hostChannelId"]),
		PG.index("connect_conversations_status_idx", ["status"]),
		PG.index("connect_conversations_deleted_at_idx", ["deletedAt"]),
		PG.uniqueIndex("connect_conversations_host_channel_unique", ["hostChannelId"], {
			where: '"deletedAt" IS NULL',
		}),
	],
})
export type ConnectConversation = PG.SelectRowOf<typeof connectConversationsTable>
export type NewConnectConversation = PG.InsertRowOf<typeof connectConversationsTable>

export const connectInvitesTable = PG.table("connect_invites", {
	columns: {
		id: PG.column(uuid(ConnectInviteId), { defaultExpr: "gen_random_uuid()" }),
		conversationId: uuid(ConnectConversationId),
		hostOrganizationId: uuid(OrganizationId),
		hostChannelId: uuid(ChannelId),
		targetKind: connectInviteTargetKindEnum,
		targetValue: varchar(255),
		guestOrganizationId: PG.nullable(uuid(OrganizationId)),
		status: PG.column(connectInviteStatusEnum, { default: "pending" }),
		allowGuestMemberAdds: PG.column(PG.bool, { default: false }),
		invitedBy: uuid(UserId),
		acceptedBy: PG.nullable(uuid(UserId)),
		acceptedAt: PG.nullable(timestamptz),
		expiresAt: PG.nullable(timestamptz),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("connect_invites_conversation_idx", ["conversationId"]),
		PG.index("connect_invites_host_org_idx", ["hostOrganizationId"]),
		PG.index("connect_invites_guest_org_idx", ["guestOrganizationId"]),
		PG.index("connect_invites_status_idx", ["status"]),
		PG.index("connect_invites_target_idx", ["targetKind", "targetValue"]),
		PG.index("connect_invites_deleted_at_idx", ["deletedAt"]),
	],
})
export type ConnectInvite = PG.SelectRowOf<typeof connectInvitesTable>
export type NewConnectInvite = PG.InsertRowOf<typeof connectInvitesTable>

export const connectParticipantsTable = PG.table("connect_participants", {
	columns: {
		id: PG.column(uuid(ConnectParticipantId), { defaultExpr: "gen_random_uuid()" }),
		conversationId: uuid(ConnectConversationId),
		channelId: uuid(ChannelId),
		userId: uuid(UserId),
		homeOrganizationId: uuid(OrganizationId),
		isExternal: PG.column(PG.bool, { default: false }),
		addedBy: PG.nullable(uuid(UserId)),
		createdAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		updatedAt: PG.column(timestamptz, { defaultExpr: "now()" }),
		deletedAt: PG.nullable(timestamptz),
	},
	primaryKey: ["id"],
	indexes: [
		PG.index("connect_participants_conversation_idx", ["conversationId"]),
		PG.index("connect_participants_channel_idx", ["channelId"]),
		PG.index("connect_participants_user_idx", ["userId"]),
		PG.index("connect_participants_deleted_at_idx", ["deletedAt"]),
		PG.uniqueIndex("connect_participants_channel_user_unique", ["channelId", "userId"], {
			where: '"deletedAt" IS NULL',
		}),
	],
})
export type ConnectParticipant = PG.SelectRowOf<typeof connectParticipantsTable>
export type NewConnectParticipant = PG.InsertRowOf<typeof connectParticipantsTable>
