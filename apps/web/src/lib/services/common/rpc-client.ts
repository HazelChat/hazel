import { HttpClient } from "@effect/platform"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { RpcClient as RpcClientBuilder, RpcSerialization } from "@effect/rpc"
import { MessageRpcs } from "@hazel/backend/rpc/groups/messages"
import { AuthMiddlewareClientLive } from "@hazel/backend/rpc/middleware/client"
import { Effect, Layer } from "effect"

/**
 * Custom Fetch Layer with Credentials
 *
 * Configures the fetch client to include credentials (cookies) with all requests.
 * This is required for the WorkOS session cookie to be sent to the backend.
 */
export const CustomFetchLive = FetchHttpClient.layer.pipe(
	Layer.provide(
		Layer.succeed(FetchHttpClient.RequestInit, {
			credentials: "include",
		}),
	),
)

export const RpcProtocolLive = RpcClientBuilder.layerProtocolHttp({
	url: `${import.meta.env.VITE_BACKEND_URL}/rpc`,
}).pipe(Layer.provide(CustomFetchLive), Layer.provide(RpcSerialization.layerNdjson))

const AllRpcs = MessageRpcs

export class RpcClient extends Effect.Service<RpcClient>()("RpcClient", {
	scoped: RpcClientBuilder.make(AllRpcs),
	dependencies: [RpcProtocolLive, AuthMiddlewareClientLive],
}) {}
