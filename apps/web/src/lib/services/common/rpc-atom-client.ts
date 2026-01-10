import { Reactivity } from "@effect/experimental"
import * as BrowserSocket from "@effect/platform-browser/BrowserSocket"
import { RpcClient as RpcClientBuilder, RpcSerialization } from "@effect/rpc"
import { AtomRpc } from "@effect-atom/atom-react"
import { AuthMiddlewareClientLive } from "@hazel/backend/rpc/middleware/client"
import {
	AttachmentRpcs,
	ChannelMemberRpcs,
	ChannelRpcs,
	ChannelSectionRpcs,
	ChannelWebhookRpcs,
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
import {
	createRpcTypeResolver,
	DevtoolsProtocolLayer,
	setRpcTypeResolver,
} from "effect-rpc-tanstack-devtools"

const backendUrl = import.meta.env.VITE_BACKEND_URL
const wsUrl = `${backendUrl.replace(/^http/, "ws")}/rpc`

// Base protocol layer
const BaseProtocolLive = RpcClientBuilder.layerProtocolSocket({
	retryTransientErrors: true,
}).pipe(Layer.provide(BrowserSocket.layerWebSocket(wsUrl)), Layer.provide(RpcSerialization.layerNdjson))

// Conditional layer composition - tree-shakeable via import.meta.env.DEV
export const RpcProtocolLive = import.meta.env.DEV
	? Layer.provideMerge(DevtoolsProtocolLayer, BaseProtocolLive)
	: BaseProtocolLive

// Build the protocol layer with middleware
const AtomRpcProtocolLive = RpcProtocolLive.pipe(
	Layer.provide(AuthMiddlewareClientLive),
	Layer.provide(Reactivity.layer),
)

const AllRpcs = MessageRpcs.merge(
	NotificationRpcs,
	InvitationRpcs,
	IntegrationRequestRpcs,
	ChannelRpcs,
	ChannelMemberRpcs,
	ChannelSectionRpcs,
	ChannelWebhookRpcs,
	GitHubSubscriptionRpcs,
	OrganizationRpcs,
	OrganizationMemberRpcs,
	UserRpcs,
	MessageReactionRpcs,
	TypingIndicatorRpcs,
	PinnedMessageRpcs,
	AttachmentRpcs,
	UserPresenceStatusRpcs,
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
