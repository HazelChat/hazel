import { ServiceMap } from "effect"
import type { ApiScope } from "./api-scope"

/**
 * Context.Tag for declaring required API scopes on RPC and HTTP endpoints.
 *
 * Usage:
 * ```typescript
 * Rpc.make("message.create", { ... })
 *     .annotate(RequiredScopes, ["messages:write"])
 * ```
 *
 * - `ReadonlyArray<ApiScope>` allows multiple scopes per endpoint
 * - Empty array `[]` = public endpoint (no scope needed)
 * - Missing annotation = error (caught by startup validation)
 */
export class RequiredScopes extends ServiceMap.Service<RequiredScopes,
	ReadonlyArray<ApiScope>
>()("@hazel/domain/RequiredScopes") {}
