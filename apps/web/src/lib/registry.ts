import { Atom, Registry } from "@effect-atom/atom-react"
import { runtimeLayer } from "./services/common/runtime"

/**
 * Global App Registry
 *
 * This registry is used for imperative atom operations outside of React components.
 * It's initialized at app startup to ensure all runtimes are properly built.
 */
export const appRegistry = Registry.make()

/**
 * Shared AtomRuntime from the runtime layer
 *
 * This creates an AtomRuntime from the same layer used by the ManagedRuntime,
 * ensuring both the imperative runtime (for collections) and the atom runtime
 * (for mutations) share the same underlying services and WebSocket connection.
 */
const sharedAtomRuntime = Atom.runtime(runtimeLayer)

/**
 * Mount the shared runtime to force initialization
 *
 * This establishes a SINGLE WebSocket connection at app startup that is shared
 * by both RpcClient (collections) and HazelRpcClient (atom mutations).
 *
 * The shared runtime contains all services:
 * - ApiClient (HTTP)
 * - RpcClient (RPC for collections)
 * - HazelRpcClient (RPC for atoms)
 *
 * Without mounting, the runtime is lazy and won't initialize until first access,
 * which causes mutations to fail when called imperatively.
 */
appRegistry.mount(sharedAtomRuntime)
