import { FetchHttpClient } from "effect/unstable/http"
import { Layer, ManagedRuntime } from "effect"
import { TokenValidationLive } from "../auth"

const MessageActorRuntimeLayer = Layer.mergeAll(TokenValidationLive, FetchHttpClient.layer)

export const messageActorRuntime = ManagedRuntime.make(MessageActorRuntimeLayer)
