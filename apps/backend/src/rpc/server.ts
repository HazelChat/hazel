import { RpcServer } from "@effect/rpc"
import {
	AttachmentRpcs,
	BotRpcs,
	ChannelMemberRpcs,
	ChannelRpcs,
	ChannelSectionRpcs,
	ChannelWebhookRpcs,
	GitHubSubscriptionRpcs,
	IntegrationRequestRpcs,
	RssSubscriptionRpcs,
	InvitationRpcs,
	MessageReactionRpcs,
	MessageRpcs,
	NotificationRpcs,
	OrganizationMemberRpcs,
	OrganizationRpcs,
	PinnedMessageRpcs,
	SandboxRpcs,
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
import { GitHubSubscriptionRpcLive } from "./handlers/github-subscriptions"
import { IntegrationRequestRpcLive } from "./handlers/integration-requests"
import { RssSubscriptionRpcLive } from "./handlers/rss-subscriptions"
import { SandboxRpcLive } from "./handlers/sandboxes"
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
	GitHubSubscriptionRpcs,
	RssSubscriptionRpcs,
	SandboxRpcs,
	AttachmentRpcs,
	BotRpcs,
).middleware(RpcLoggingMiddleware)

export const RpcServerLive = Layer.empty
	.pipe(
		Layer.provideMerge(MessageRpcLive),
		Layer.provideMerge(MessageReactionRpcLive),
		Layer.provideMerge(NotificationRpcLive),
		Layer.provideMerge(InvitationRpcLive),
		Layer.provideMerge(IntegrationRequestRpcLive),
		Layer.provideMerge(TypingIndicatorRpcLive),
		Layer.provideMerge(PinnedMessageRpcLive),
		Layer.provideMerge(OrganizationRpcLive),
		Layer.provideMerge(OrganizationMemberRpcLive),
		Layer.provideMerge(UserRpcLive),
		Layer.provideMerge(UserPresenceStatusRpcLive),
		Layer.provideMerge(ChannelRpcLive),
		Layer.provideMerge(ChannelMemberRpcLive),
		Layer.provideMerge(ChannelSectionRpcLive),
		Layer.provideMerge(ChannelWebhookRpcLive),
		Layer.provideMerge(GitHubSubscriptionRpcLive),
		Layer.provideMerge(RssSubscriptionRpcLive),
		Layer.provideMerge(SandboxRpcLive),
		Layer.provideMerge(AttachmentRpcLive),
		Layer.provideMerge(BotRpcLive),
	)
	.pipe(Layer.provideMerge(AuthMiddlewareLive), Layer.provideMerge(RpcLoggingMiddlewareLive))
