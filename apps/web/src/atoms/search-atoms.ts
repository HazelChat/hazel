import { BrowserKeyValueStore } from "@effect/platform-browser"
import { Atom } from "@effect-atom/atom-react"
import { Schema } from "effect"
import type { FilterType, SearchFilter } from "~/lib/search-filter-parser"

export const MAX_RECENT_SEARCHES = 10

/**
 * Schema for a resolved search filter
 */
const SearchFilterSchema = Schema.Struct({
	type: Schema.Literal("from", "in", "has", "before", "after"),
	value: Schema.String,
	displayValue: Schema.String,
	id: Schema.String,
})

/**
 * Schema for a saved recent search
 */
const RecentSearchSchema = Schema.Struct({
	query: Schema.String,
	filters: Schema.Array(SearchFilterSchema),
	timestamp: Schema.Number,
})

export type RecentSearch = typeof RecentSearchSchema.Type

/**
 * Schema for the array of recent searches
 */
const RecentSearchesSchema = Schema.Array(RecentSearchSchema)

/**
 * localStorage runtime for recent searches persistence
 */
const localStorageRuntime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage)

/**
 * Atom that stores recent searches in localStorage
 */
export const recentSearchesAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "recentSearches",
	schema: RecentSearchesSchema,
	defaultValue: () => [] as RecentSearch[],
}).pipe(Atom.keepAlive)

/**
 * Search state for active search session
 */
export interface SearchState {
	/** Text query (excludes filter syntax) */
	query: string
	/** Full raw input including filter syntax */
	rawInput: string
	/** Resolved filters with IDs */
	filters: SearchFilter[]
	/** Filter type currently being typed (for autocomplete) */
	activeFilterType: FilterType | null
	/** Partial value being typed for active filter */
	activeFilterPartial: string
	/** Selected result index for keyboard navigation */
	selectedIndex: number
}

/**
 * Initial search state
 */
export const initialSearchState: SearchState = {
	query: "",
	rawInput: "",
	filters: [],
	activeFilterType: null,
	activeFilterPartial: "",
	selectedIndex: 0,
}

/**
 * Main search state atom for the current search session
 */
export const searchStateAtom = Atom.make<SearchState>(initialSearchState).pipe(Atom.keepAlive)

/**
 * Derived atom that checks if search is active (has query or filters)
 */
export const hasActiveSearchAtom = Atom.make((get) => {
	const state = get(searchStateAtom)
	return state.query.length > 0 || state.filters.length > 0
}).pipe(Atom.keepAlive)

/**
 * Derived atom that checks if autocomplete suggestions should show
 */
export const showAutocompleteSuggestionsAtom = Atom.make((get) => {
	const state = get(searchStateAtom)
	return state.activeFilterType !== null
}).pipe(Atom.keepAlive)
