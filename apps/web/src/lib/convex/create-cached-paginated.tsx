import { createEffect, createMemo, createSignal, onCleanup } from "solid-js"
import {
	type CreatePaginatedQueryReturnType,
	type PaginatedQueryArgs,
	type PaginatedQueryItem,
	type PaginatedQueryReference,
	createPaginatedQuery,
} from "./create-paginated"

export function createCachedPaginatedQuery<Query extends PaginatedQueryReference>(
	query: Query,
	args: PaginatedQueryArgs<Query> | "skip",
	options: { initialNumItems: number },
	cacheKey: string,
): CreatePaginatedQueryReturnType<Query> {
	const [cached, setCached] = createSignal<PaginatedQueryItem<Query>[]>([])

	createEffect(() => {
		const id = setTimeout(() => {
			try {
				const raw = localStorage.getItem(cacheKey)
				setCached(raw ? (JSON.parse(raw) as PaginatedQueryItem<Query>[]) : [])
			} catch {
				setCached([])
			}
		})
		onCleanup(() => clearTimeout(id))
	})

	const paginated = createPaginatedQuery(query, args as PaginatedQueryArgs<Query>, options)

	createEffect(() => {
		const results = paginated.results()
		if (results.length > 0) {
			setCached(results as PaginatedQueryItem<Query>[])
			try {
				localStorage.setItem(cacheKey, JSON.stringify(results))
			} catch {
				/* ignore */
			}
		}
	})

	const combinedResults = createMemo(() => {
		const res = paginated.results()
		return res.length > 0 ? res : cached()
	})

	return {
		...paginated,
		results: combinedResults,
	} as CreatePaginatedQueryReturnType<Query>
}
