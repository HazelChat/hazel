import { Reactivity } from "@effect/experimental"
import { FetchHttpClient } from "@effect/platform"
import { RpcClient as RpcClientBuilder, RpcSerialization } from "@effect/rpc"
import { AtomRpc } from "@effect-atom/atom-react"
import { AuthMiddlewareClientLive } from "~/lib/rpc-auth-middleware"
import {
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
	RssSubscriptionRpcs,
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
import {
	createRpcTypeResolver,
	DevtoolsProtocolLayer,
	setRpcTypeResolver,
} from "effect-rpc-tanstack-devtools"

const backendUrl = import.meta.env.VITE_BACKEND_URL
const httpUrl = `${backendUrl}/rpc`

const BaseProtocolLive = RpcClientBuilder.layerProtocolHttp({
	url: httpUrl,
}).pipe(Layer.provide(FetchHttpClient.layer), Layer.provide(RpcSerialization.layerNdjson))

export const RpcProtocolLive = BaseProtocolLive

// Build the protocol layer with middleware
// Use Layer.mergeAll to make AuthMiddlewareClientLive available alongside the protocol
const AtomRpcProtocolLive = Layer.mergeAll(RpcProtocolLive, AuthMiddlewareClientLive, Reactivity.layer)

const AllRpcs = MessageRpcs.merge(
	NotificationRpcs,
	InvitationRpcs,
	IntegrationRequestRpcs,
	ChannelRpcs,
	ChannelMemberRpcs,
	ChannelSectionRpcs,
	ChannelWebhookRpcs,
	CustomEmojiRpcs,
	GitHubSubscriptionRpcs,
	RssSubscriptionRpcs,
	OrganizationRpcs,
	OrganizationMemberRpcs,
	UserRpcs,
	MessageReactionRpcs,
	TypingIndicatorRpcs,
	PinnedMessageRpcs,
	AttachmentRpcs,
	UserPresenceStatusRpcs,
	BotRpcs,
	ChatSyncRpcs,
)

// Configure RPC type resolver for devtools (only in dev mode)
if (import.meta.env.DEV) {
	setRpcTypeResolver(createRpcTypeResolver([AllRpcs]))
}

export class HazelRpcClient extends AtomRpc.Tag<HazelRpcClient>()("HazelRpcClient", {
	group: AllRpcs,
	// @ts-expect-error
	protocol: AtomRpcProtocolLive,
}) {}

export type { RpcClientError } from "@effect/rpc"
