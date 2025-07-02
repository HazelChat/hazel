import { type Cursor, type FunctionReturnType, getFunctionName, type PaginationOptions } from "convex/server"
import { type Accessor, createEffect, createMemo, untrack } from "solid-js"
import { createStore, produce, reconcile, type Store } from "solid-js/store"
import {
	createQuery,
	type OptionalRestArgsOrSkip,
	type PaginatedQueryArgs,
	type PaginatedQueryReference,
} from "../convex"

/**
 * Load data reactively from a paginated query, one page at a time.
 *
 * Use `loadNext` and `loadPrev` to navigate through pages.
 *
 * @param query A reference to the public paginated query function.
 * @param args The arguments object for the query function, excluding the `paginationOpts` property.
 * @param options An object specifying the `initialNumItems` to be loaded in the first page.
 * @returns The paginated query result, in the form of a discriminated union.
 */
export const createNextPrevPaginatedQuery = <Query extends PaginatedQueryReference>(
	query: Query,
	args: Accessor<PaginatedQueryArgs<Query> | "skip">,
	options: Accessor<{ initialNumItems: number }>,
): Accessor<Result<Query>> => {
	const queryName = getFunctionName(query)

	const [state, setState] = createStore<State<Query>>(
		createInitialState({
			queryName,
			args: args(),
			options: options(),
		}),
	)

	// Watch for args or options changes
	createEffect(() => {
		const currentArgs = args()
		const currentOptions = options()

		if (currentOptions.initialNumItems <= 0) {
			throw new Error("Initial number of items must be greater than zero")
		}

		const shouldUpdate = untrack(() => {
			if (
				(state._tag !== "Skipped" &&
					(JSON.stringify(state.args) !== JSON.stringify(currentArgs) ||
						state.initialNumItems !== currentOptions.initialNumItems ||
						state.queryName !== queryName)) ||
				(state._tag === "Skipped" && currentArgs !== "skip")
			) {
				return true
			}
			return false
		})

		if (shouldUpdate) {
			setState(
				reconcile(
					createInitialState({
						queryName,
						args: currentArgs,
						options: currentOptions,
					}),
				),
			)
		}
	})

	const mergedArgs = createMemo(() => {
		console.log(computeMergedArgs(state))
		return [computeMergedArgs(state)]
	})

	const queryResults = createQuery(query, mergedArgs as any)

	createEffect(() => {
		const results = queryResults()
		if (results) {
			setState(
				produce((draft) => {
					handleGotResults(draft, results, results.isDone ? null : results.continueCursor)
				}),
			)
		}
	})

	// Create result accessor with actions
	return createMemo(() => {
		const dispatch = (action: ActionType<Query>) => {
			setState(produce((draft) => applyAction(draft, action)))
		}

		return createResult(state, dispatch)
	})
}

/**
 * The result of a paginated query, modeled as a discriminated union.
 */
export type Result<Query extends PaginatedQueryReference> =
	| { _tag: "Skipped" }
	| { _tag: "LoadingInitialResults" }
	| {
			_tag: "Loaded"
			/** @deprecated Use `page` instead. */
			results: FunctionReturnType<Query>["page"]
			/** The current page of results. */
			page: FunctionReturnType<Query>["page"]
			/** The number of the current page (1-indexed). */
			pageNum: number
			/** A function which loads the next page of results, or null if this is the last page. */
			loadNext: (() => void) | null
			/** A function which loads the previous page of results, or null if this is the first page. */
			loadPrev: (() => void) | null
	  }
	| { _tag: "LoadingNextResults" }
	| { _tag: "LoadingPrevResults" }

type State<Query extends PaginatedQueryReference> =
	| { _tag: "Skipped" }
	| {
			_tag: "LoadingInitialResults"
			queryName: string
			args: PaginatedQueryArgs<Query>
			initialNumItems: number
	  }
	| {
			_tag: "LoadingNextResults"
			queryName: string
			args: PaginatedQueryArgs<Query>
			initialNumItems: number
			loadingCursor: Cursor | null
			prevCursors: Cursor[]
	  }
	| {
			_tag: "LoadingPrevResults"
			queryName: string
			args: PaginatedQueryArgs<Query>
			initialNumItems: number
			loadingCursor: Cursor | null
			prevCursors: Cursor[]
	  }
	| {
			_tag: "Loaded"
			queryName: string
			args: PaginatedQueryArgs<Query>
			initialNumItems: number
			currentResults: FunctionReturnType<Query>
			currentCursor: Cursor | null
			prevCursors: Cursor[]
			nextCursor: Cursor | null
	  }

type ActionType<_Query extends PaginatedQueryReference> =
	| { _tag: "NextPageRequested" }
	| { _tag: "PrevPageRequested" }

const applyAction = <Query extends PaginatedQueryReference>(
	state: State<Query>,
	action: ActionType<Query>,
): void => {
	switch (action._tag) {
		case "PrevPageRequested":
			if (state._tag === "Loaded") {
				const loadingCursor = state.prevCursors[state.prevCursors?.length - 1] ?? null
				const prevCursors = state.prevCursors.slice(0, -1)

				Object.assign(state, {
					_tag: "LoadingPrevResults",
					loadingCursor,
					prevCursors,
				})
			} else {
				throw new Error("Cannot load previous page unless the current page is loaded")
			}
			break

		case "NextPageRequested":
			if (state._tag === "Loaded") {
				Object.assign(state, {
					_tag: "LoadingNextResults",
					loadingCursor: state.nextCursor,
					prevCursors: [
						...state.prevCursors,
						...(state.currentCursor ? [state.currentCursor] : []),
					],
				})
			} else {
				throw new Error("Cannot load next page unless the current page is loaded")
			}
			break
	}
}

const handleGotResults = <Query extends PaginatedQueryReference>(
	state: State<Query>,
	results: FunctionReturnType<Query>,
	nextCursor: Cursor | null,
): void => {
	if (
		state._tag === "LoadingInitialResults" ||
		state._tag === "LoadingNextResults" ||
		state._tag === "LoadingPrevResults"
	) {
		Object.assign(state, {
			_tag: "Loaded",
			currentResults: results,
			currentCursor: state._tag === "LoadingInitialResults" ? null : state.loadingCursor,
			nextCursor,
		})
	} else if (state._tag === "Loaded") {
		Object.assign(state, {
			currentResults: results,
			nextCursor,
		})
	}
}

const computeMergedArgs = <Query extends PaginatedQueryReference>(
	state: Store<State<Query>>,
): PaginatedQueryArgs<Query> | "skip" => {
	if (state._tag === "Skipped") {
		return "skip" as const
	}

	const cursor = (() => {
		switch (state._tag) {
			case "LoadingInitialResults":
				return null
			case "LoadingNextResults":
			case "LoadingPrevResults":
				return state.loadingCursor
			case "Loaded":
				return state.currentCursor
			default:
				throw new Error(`Invalid state: ${(state as any)._tag}`)
		}
	})()

	return {
		...state.args,
		paginationOpts: {
			numItems: state.initialNumItems,
			cursor,
		} satisfies PaginationOptions,
	}
}

const createResult = <Query extends PaginatedQueryReference>(
	state: Store<State<Query>>,
	dispatch: (action: ActionType<Query>) => void,
): Result<Query> => {
	switch (state._tag) {
		case "Skipped":
			return { _tag: "Skipped" }
		case "LoadingInitialResults":
			return { _tag: "LoadingInitialResults" }
		case "Loaded":
			return {
				_tag: "Loaded",
				results: state.currentResults.page,
				page: state.currentResults.page,
				pageNum: 1 + state.prevCursors?.length + (state.currentCursor ? 1 : 0),
				loadNext: createLoadNext(state, dispatch),
				loadPrev: createLoadPrev(state, dispatch),
			}
		case "LoadingNextResults":
			return { _tag: "LoadingNextResults" }
		case "LoadingPrevResults":
			return { _tag: "LoadingPrevResults" }
		default:
			throw new Error(`Invalid state: ${(state as any)._tag}`)
	}
}

const createLoadPrev = <Query extends PaginatedQueryReference>(
	state: Store<State<Query>>,
	dispatch: (action: ActionType<Query>) => void,
): (() => void) | null => {
	if (state._tag === "Loaded" && (state.prevCursors?.length > 0 || state.currentCursor !== null)) {
		return () => dispatch({ _tag: "PrevPageRequested" })
	}
	return null
}

const createLoadNext = <Query extends PaginatedQueryReference>(
	state: Store<State<Query>>,
	dispatch: (action: ActionType<Query>) => void,
): (() => void) | null => {
	if (state._tag === "Loaded" && state.nextCursor !== null) {
		return () => dispatch({ _tag: "NextPageRequested" })
	}
	return null
}

const createInitialState = <Query extends PaginatedQueryReference>({
	queryName,
	args,
	options,
}: {
	queryName: string
	args: PaginatedQueryArgs<Query> | "skip"
	options: { initialNumItems: number }
}): State<Query> =>
	args === "skip"
		? { _tag: "Skipped" }
		: {
				_tag: "LoadingInitialResults" as const,
				queryName,
				args,
				initialNumItems: options.initialNumItems,
			}
