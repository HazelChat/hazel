import { RpcClient as RpcClientBuilder, RpcSerialization } from "@effect/rpc"
import { AtomRpc } from "@effect-atom/atom-react"
import { AuthMiddlewareClientLive } from "@hazel/backend/rpc/middleware/client"
import {
	AttachmentRpcs,
	ChannelMemberRpcs,
	ChannelRpcs,
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
import { CustomFetchLive } from "./api-client"

const backendUrl = import.meta.env.VITE_BACKEND_URL
const httpUrl = `${backendUrl}/rpc`

export const RpcProtocolLive = RpcClientBuilder.layerProtocolHttp({
	url: httpUrl,
}).pipe(Layer.provide(CustomFetchLive), Layer.provide(RpcSerialization.layerJson))

const AtomRpcProtocolLive = RpcProtocolLive.pipe(Layer.provide(AuthMiddlewareClientLive))

const AllRpcs = MessageRpcs.merge(
	NotificationRpcs,
	InvitationRpcs,
	ChannelRpcs,
	ChannelMemberRpcs,
	OrganizationRpcs,
	OrganizationMemberRpcs,
	UserRpcs,
	MessageReactionRpcs,
	TypingIndicatorRpcs,
	PinnedMessageRpcs,
	AttachmentRpcs,
	UserPresenceStatusRpcs,
)

export class HazelRpcClient extends AtomRpc.Tag<HazelRpcClient>()("HazelRpcClient", {
	group: AllRpcs,
	// @ts-expect-error
	protocol: AtomRpcProtocolLive,
}) {}

export type { RpcClientError } from "@effect/rpc"
