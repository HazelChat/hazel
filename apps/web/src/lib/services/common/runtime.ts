import { Layer, ManagedRuntime } from "effect"
import { ApiClient } from "./api-client"

export const runtime = ManagedRuntime.make(Layer.mergeAll(ApiClient.Default))
