import type { QueryClient as TanstackQueryClient } from "@tanstack/solid-query"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export class QueryClient extends Effect.Tag("@/common/QueryClient")<QueryClient, TanstackQueryClient>() {
	public static readonly make = (queryClient: TanstackQueryClient) => Layer.succeed(this, this.of(queryClient))
}
