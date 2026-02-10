import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { GiphyCategory, GiphyGif, GiphySearchResponse } from "@hazel/domain/http"
import { Exit } from "effect"
import { useCallback, useMemo, useRef, useState } from "react"
import { HazelApiClient } from "~/lib/services/common/atom-client"

interface UseGiphyOptions {
	limit?: number
}

interface UseGiphyReturn {
	gifs: GiphyGif[]
	categories: GiphyCategory[]
	isLoading: boolean
	hasMore: boolean
	loadMore: () => void
	search: (query: string) => void
	searchQuery: string
}

export function useGiphy({ limit = 25 }: UseGiphyOptions = {}): UseGiphyReturn {
	// === Auto-fetching query atoms (no useEffect needed) ===
	const trendingResult = useAtomValue(
		HazelApiClient.query("giphy", "trending", { urlParams: { offset: 0, limit } }),
	)
	const categoriesResult = useAtomValue(HazelApiClient.query("giphy", "categories", {}))

	// === Mutation atoms for user-triggered fetches ===
	const searchAtom = useMemo(() => HazelApiClient.mutation("giphy", "search"), [])
	const trendingMutAtom = useMemo(() => HazelApiClient.mutation("giphy", "trending"), [])
	const searchMutation = useAtomSet(searchAtom, { mode: "promiseExit" })
	const trendingMutation = useAtomSet(trendingMutAtom, { mode: "promiseExit" })

	const searchRef = useRef(searchMutation)
	searchRef.current = searchMutation
	const trendingMutRef = useRef(trendingMutation)
	trendingMutRef.current = trendingMutation

	// === User interaction state ===
	// null = showing trending query result; non-null = user has searched or loaded more
	const [overrideGifs, setOverrideGifs] = useState<GiphyGif[] | null>(null)
	const [isMutating, setIsMutating] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const [searchQuery, setSearchQuery] = useState("")

	const offsetRef = useRef(0)
	const currentQueryRef = useRef("")
	const isMutatingRef = useRef(false)
	const hasMoreRef = useRef(true)
	const requestIdRef = useRef(0)

	// Initialize offset from trending query result
	const trendingInitRef = useRef(false)
	if (!trendingInitRef.current && Result.isSuccess(trendingResult) && overrideGifs === null) {
		trendingInitRef.current = true
		const p = trendingResult.value.pagination
		offsetRef.current = p.offset + p.count
		const more = p.offset + p.count < p.total_count
		hasMoreRef.current = more
		setHasMore(more)
	}

	// === Derived display values ===
	const categories = Result.isSuccess(categoriesResult) ? [...categoriesResult.value.data] : []

	let gifs: GiphyGif[]
	let isLoading: boolean

	if (overrideGifs !== null) {
		gifs = overrideGifs
		isLoading = isMutating
	} else if (Result.isSuccess(trendingResult)) {
		gifs = [...trendingResult.value.data]
		isLoading = false
	} else {
		gifs = []
		isLoading = true
	}

	// Keep a ref to current gifs for loadMore's append base
	const gifsRef = useRef(gifs)
	gifsRef.current = gifs

	// === Fetch function for search & load-more ===
	const fetchGifs = useCallback(
		async (query: string, offset: number, append: boolean) => {
			const id = ++requestIdRef.current
			isMutatingRef.current = true
			setIsMutating(true)
			try {
				let exit: Exit.Exit<GiphySearchResponse, unknown>
				if (query) {
					exit = await searchRef.current({ urlParams: { q: query, offset, limit } })
				} else {
					exit = await trendingMutRef.current({ urlParams: { offset, limit } })
				}

				if (requestIdRef.current !== id) return

				if (Exit.isSuccess(exit)) {
					const data = exit.value
					if (append) {
						setOverrideGifs((prev) => [...(prev ?? gifsRef.current), ...data.data])
					} else {
						setOverrideGifs([...data.data])
					}
					const newHasMore =
						data.pagination.offset + data.pagination.count < data.pagination.total_count
					hasMoreRef.current = newHasMore
					setHasMore(newHasMore)
					offsetRef.current = offset + data.pagination.count
				} else {
					console.error("[GifPicker] Fetch failed:", Exit.isFailure(exit) ? exit.cause : exit)
				}
			} catch (error) {
				if (requestIdRef.current !== id) return
				console.error("[GifPicker] Fetch error:", error)
			} finally {
				isMutatingRef.current = false
				setIsMutating(false)
			}
		},
		[limit],
	)

	const search = useCallback(
		(query: string) => {
			setSearchQuery(query)
			currentQueryRef.current = query
			offsetRef.current = 0
			hasMoreRef.current = true
			setHasMore(true)
			if (query === "") {
				// Reset to trending query result
				setOverrideGifs(null)
				trendingInitRef.current = false
				return
			}
			setOverrideGifs([])
			fetchGifs(query, 0, false)
		},
		[fetchGifs],
	)

	const loadMore = useCallback(() => {
		if (isMutatingRef.current || !hasMoreRef.current) return
		fetchGifs(currentQueryRef.current, offsetRef.current, true)
	}, [fetchGifs])

	return {
		gifs,
		categories,
		isLoading,
		hasMore,
		loadMore,
		search,
		searchQuery,
	}
}
