import type * as Layer from "effect/Layer"
import type * as ManagedRuntime from "effect/ManagedRuntime"
import type { ApiClient } from "./common/api-client.tsx"
import type { NetworkMonitor } from "./common/network-monitor.tsx"
import type { QueryClient } from "./common/query-client.tsx"

export type LiveLayerType = Layer.Layer<ApiClient | NetworkMonitor | QueryClient>
export type LiveManagedRuntime = ManagedRuntime.ManagedRuntime<Layer.Layer.Success<LiveLayerType>, never>
export type LiveRuntimeContext = ManagedRuntime.ManagedRuntime.Context<LiveManagedRuntime>
