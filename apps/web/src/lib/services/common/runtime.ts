import { Layer, ManagedRuntime } from "effect"
import { ApiClient } from "./api-client"
import { RpcClient } from "./rpc-client"

export const runtime = ManagedRuntime.make(Layer.mergeAll(ApiClient.Default, RpcClient.Default))
