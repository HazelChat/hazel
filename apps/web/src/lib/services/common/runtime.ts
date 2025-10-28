import { Atom } from "@effect-atom/atom-react"
import { Layer, ManagedRuntime } from "effect"
import { ApiClient } from "./api-client"
import { HazelRpcClient } from "./rpc-atom-client"
import { RpcClient } from "./rpc-client"

/**
 * Shared layer containing all services
 *
 * This layer includes:
 * - ApiClient: HTTP client for REST API calls
 * - RpcClient: RPC client for collection mutations
 * - HazelRpcClient: RPC client for atom mutations
 *
 * All RPC clients share the same WebSocket connection via RpcProtocolLive.
 */
export const runtimeLayer = Layer.mergeAll(ApiClient.Default, RpcClient.Default, HazelRpcClient.layer)

/**
 * Managed runtime for imperative Effect execution
 *
 * Uses Atom.defaultMemoMap to ensure layer memoization is shared with
 * Atom.runtime() calls. This prevents duplicate WebSocket connections by
 * ensuring both the ManagedRuntime (for collections) and AtomRuntime (for
 * mutations) build layers with the same MemoMap, allowing Effect to reuse
 * already-built layer instances.
 *
 * Used by collections.ts and other imperative code that calls runtime.runPromise().
 */
export const runtime = ManagedRuntime.make(runtimeLayer, Atom.defaultMemoMap)
