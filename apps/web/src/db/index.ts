import { ConvexQueryClient, convexQuery } from "@convex-dev/react-query"
import { QueryClient } from "@tanstack/react-query"
import { ConvexReactClient } from "convex/react"
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server"

export const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

export const convexQueryClient = new ConvexQueryClient(convex)

export const queryClient: QueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
		},
	},
})

export function convexQueryOptions<
	ConvexQueryReference extends FunctionReference<"query">,
	Args extends FunctionArgs<ConvexQueryReference>,
>(funcRef: ConvexQueryReference, queryArgs: Args) {
	const queryOptions = convexQuery(funcRef, queryArgs)

	return {
		queryClient,
		queryKey: queryOptions.queryKey,
		staleTime: queryOptions.staleTime,
		queryFn: async (): Promise<FunctionReturnType<ConvexQueryReference>> => {
			return await convex.query(funcRef, queryArgs)
		},
	}
}
