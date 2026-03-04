import type { RpcGroup } from "@effect/rpc"
import type {
	AttachmentRpcs,
	BotRpcs,
	ChannelMemberRpcs,
	ChannelRpcs,
	ChannelSectionRpcs,
	ChannelWebhookRpcs,
	ChatSyncRpcs,
	CustomEmojiRpcs,
	GitHubSubscriptionRpcs,
	IntegrationRequestRpcs,
	InvitationRpcs,
	MessageReactionRpcs,
	MessageRpcs,
	NotificationRpcs,
	OrganizationMemberRpcs,
	OrganizationRpcs,
	PinnedMessageRpcs,
	RssSubscriptionRpcs,
	TypingIndicatorRpcs,
	UserPresenceStatusRpcs,
	UserRpcs,
} from "../rpc"

type ActionOf<G> = RpcGroup.Rpcs<G>["_tag"]

/**
 * Union of all valid RPC action names (e.g. "message.create", "channel.delete").
 * Extracted from the RPC group definitions at the type level.
 */
export type RpcActionName =
	| ActionOf<AttachmentRpcs>
	| ActionOf<BotRpcs>
	| ActionOf<ChannelMemberRpcs>
	| ActionOf<ChannelRpcs>
	| ActionOf<ChannelSectionRpcs>
	| ActionOf<ChannelWebhookRpcs>
	| ActionOf<ChatSyncRpcs>
	| ActionOf<CustomEmojiRpcs>
	| ActionOf<GitHubSubscriptionRpcs>
	| ActionOf<IntegrationRequestRpcs>
	| ActionOf<InvitationRpcs>
	| ActionOf<MessageReactionRpcs>
	| ActionOf<MessageRpcs>
	| ActionOf<NotificationRpcs>
	| ActionOf<OrganizationMemberRpcs>
	| ActionOf<OrganizationRpcs>
	| ActionOf<PinnedMessageRpcs>
	| ActionOf<RssSubscriptionRpcs>
	| ActionOf<TypingIndicatorRpcs>
	| ActionOf<UserPresenceStatusRpcs>
	| ActionOf<UserRpcs>
