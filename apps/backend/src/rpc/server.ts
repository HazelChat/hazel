import { RpcServer } from "@effect/rpc"
import {
	AttachmentRpcs,
	BotRpcs,
	ChannelMemberRpcs,
	ChannelRpcs,
	ChannelSectionRpcs,
	ChannelWebhookRpcs,
	DiscordRpcs,
	ExternalChannelLinkRpcs,
	GitHubSubscriptionRpcs,
	IntegrationRequestRpcs,
	InvitationRpcs,
	MessageReactionRpcs,
	MessageRpcs,
	NotificationRpcs,
	OrganizationMemberRpcs,
	OrganizationRpcs,
	PinnedMessageRpcs,
	TypingIndicatorRpcs,
	UserPresenceStatusRpcs,
	UserRpcs,
} from "@hazel/domain/rpc"
import { Layer } from "effect"
import { AttachmentRpcLive } from "./handlers/attachments"
import { BotRpcLive } from "./handlers/bots"
import { ChannelMemberRpcLive } from "./handlers/channel-members"
import { ChannelSectionRpcLive } from "./handlers/channel-sections"
import { ChannelWebhookRpcLive } from "./handlers/channel-webhooks"
import { ChannelRpcLive } from "./handlers/channels"
import { DiscordRpcLive } from "./handlers/discord"
import { ExternalChannelLinkRpcLive } from "./handlers/external-channel-links"
import { GitHubSubscriptionRpcLive } from "./handlers/github-subscriptions"
import { IntegrationRequestRpcLive } from "./handlers/integration-requests"
import { InvitationRpcLive } from "./handlers/invitations"
import { MessageReactionRpcLive } from "./handlers/message-reactions"
import { MessageRpcLive } from "./handlers/messages"
import { NotificationRpcLive } from "./handlers/notifications"
import { OrganizationMemberRpcLive } from "./handlers/organization-members"
import { OrganizationRpcLive } from "./handlers/organizations"
import { PinnedMessageRpcLive } from "./handlers/pinned-messages"
import { TypingIndicatorRpcLive } from "./handlers/typing-indicators"
import { UserPresenceStatusRpcLive } from "./handlers/user-presence-status"
import { UserRpcLive } from "./handlers/users"
import { AuthMiddlewareLive } from "./middleware/auth"
import { RpcLoggingMiddlewareLive } from "./middleware/logging"
import { RpcLoggingMiddleware } from "./middleware/logging-class"

/**
 * RPC Server Configuration
 *
 * This file sets up the Effect RPC server with all RPC groups and their handlers.
 *
 * Architecture:
 * 1. Define RPC groups (in ./groups/*.ts) - API schema definitions
 * 2. Implement handlers (in ./handlers/*.ts) - Business logic
 * 3. Combine into server layer (here) - Server setup
 * 4. Add HTTP protocol (in index.ts) - Transport layer
 *
 */

export const AllRpcs = MessageRpcs.merge(
	MessageReactionRpcs,
	NotificationRpcs,
	InvitationRpcs,
	IntegrationRequestRpcs,
	TypingIndicatorRpcs,
	PinnedMessageRpcs,
	OrganizationRpcs,
	OrganizationMemberRpcs,
	UserRpcs,
	UserPresenceStatusRpcs,
	ChannelRpcs,
	ChannelMemberRpcs,
	ChannelSectionRpcs,
	ChannelWebhookRpcs,
	ExternalChannelLinkRpcs,
	GitHubSubscriptionRpcs,
	AttachmentRpcs,
	BotRpcs,
	DiscordRpcs,
).middleware(RpcLoggingMiddleware)

// Split into smaller groups to avoid TypeScript limit on chained Layer.provideMerge
const MessageHandlers = Layer.mergeAll(
	MessageRpcLive,
	MessageReactionRpcLive,
	NotificationRpcLive,
	InvitationRpcLive,
	IntegrationRequestRpcLive,
	TypingIndicatorRpcLive,
	PinnedMessageRpcLive,
)

const OrgHandlers = Layer.mergeAll(
	OrganizationRpcLive,
	OrganizationMemberRpcLive,
	UserRpcLive,
	UserPresenceStatusRpcLive,
)

const ChannelHandlers = Layer.mergeAll(
	ChannelRpcLive,
	ChannelMemberRpcLive,
	ChannelSectionRpcLive,
	ChannelWebhookRpcLive,
	ExternalChannelLinkRpcLive,
	GitHubSubscriptionRpcLive,
)

const OtherHandlers = Layer.mergeAll(AttachmentRpcLive, BotRpcLive, DiscordRpcLive)

const MiddlewareLayers = Layer.mergeAll(AuthMiddlewareLive, RpcLoggingMiddlewareLive)

export const RpcServerLive = Layer.mergeAll(
	MessageHandlers,
	OrgHandlers,
	ChannelHandlers,
	OtherHandlers,
	MiddlewareLayers,
)
