import { FiberRef } from "effect"
import type { ApiScope } from "./api-scope"

/**
 * FiberRef holding the required scopes for the currently executing RPC.
 *
 * Populated by the ScopeInjectionMiddleware (via Effect.locally) from the
 * RPC's RequiredScopes annotation. Policy utilities read from this instead
 * of accepting hardcoded scope strings, ensuring annotation and enforcement
 * always match.
 *
 * Uses FiberRef (not Context.Tag) so it doesn't leak into the R type of
 * Effect.Service layers.
 */
export const CurrentRpcScopes = FiberRef.unsafeMake<ReadonlyArray<ApiScope>>([])
