"use client"

import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { ChannelId, UserId } from "@hazel/schema"
import { useNavigate } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "react-aria-components"
import IconClose from "~/components/icons/icon-close"
import IconMagnifier from "~/components/icons/icon-magnifier-3"
import { Loader } from "~/components/ui/loader"
import { useOrganization } from "~/hooks/use-organization"
import { useSearchQuery } from "~/hooks/use-search-query"
import { useAuth } from "~/lib/auth"
import { cn } from "~/lib/utils"
import { parseSearchInput, type SearchFilter } from "~/lib/search-filter-parser"
import {
	initialSearchState,
	MAX_RECENT_SEARCHES,
	recentSearchesAtom,
	searchStateAtom,
	type RecentSearch,
} from "~/atoms/search-atoms"
import { SearchSlateEditor, type SearchSlateEditorRef } from "./search-slate-editor"
import { SearchFilterChipGroup } from "./search-filter-chip"
import { SearchResultItem } from "./search-result-item"

interface SearchViewProps {
	onClose: () => void
}

/**
 * Main search view for the command palette
 */
export function SearchView({ onClose }: SearchViewProps) {
	const { slug: orgSlug, organizationId } = useOrganization()
	const { user } = useAuth()
	const navigate = useNavigate()

	// Search state
	const searchState = useAtomValue(searchStateAtom)
	const setSearchState = useAtomSet(searchStateAtom)

	// Recent searches
	const recentSearches = useAtomValue(recentSearchesAtom)
	const setRecentSearches = useAtomSet(recentSearchesAtom)

	// Local input state for controlled input
	const [inputValue, setInputValue] = useState("")
	const editorRef = useRef<SearchSlateEditorRef>(null)

	// Focus editor on mount
	useEffect(() => {
		editorRef.current?.focus()
	}, [])

	// Search results
	const { results, isLoading, isEmpty, hasQuery } = useSearchQuery({
		query: searchState.query,
		filters: searchState.filters,
		organizationId: organizationId ?? null,
		userId: user?.id as UserId | undefined,
	})

	// Parse input and update search state
	const handleInputChange = useCallback(
		(value: string) => {
			setInputValue(value)

			const parsed = parseSearchInput(value)

			setSearchState((prev) => ({
				...prev,
				rawInput: value,
				query: parsed.textQuery,
				selectedIndex: 0,
			}))
		},
		[setSearchState],
	)

	// Remove a filter
	const removeFilter = useCallback(
		(index: number) => {
			setSearchState((prev) => ({
				...prev,
				filters: prev.filters.filter((_, i) => i !== index),
				selectedIndex: 0,
			}))
			editorRef.current?.focus()
		},
		[setSearchState],
	)

	// Handle filter selection from autocomplete
	const handleFilterSelect = useCallback(
		(filter: SearchFilter) => {
			setSearchState((prev) => ({
				...prev,
				filters: [...prev.filters, filter],
				selectedIndex: 0,
			}))
		},
		[setSearchState],
	)

	// Handle backspace at start of input to remove last filter
	const handleBackspaceAtStart = useCallback(() => {
		if (searchState.filters.length > 0) {
			removeFilter(searchState.filters.length - 1)
		}
	}, [searchState.filters.length, removeFilter])

	// Handle arrow key navigation for search results OR recent searches
	const handleArrowDown = useCallback(() => {
		const maxIndex = hasQuery ? results.length - 1 : recentSearches.length - 1
		if (maxIndex < 0) return
		setSearchState((prev) => ({
			...prev,
			selectedIndex: Math.min(prev.selectedIndex + 1, maxIndex),
		}))
	}, [hasQuery, results.length, recentSearches.length, setSearchState])

	const handleArrowUp = useCallback(() => {
		setSearchState((prev) => ({
			...prev,
			selectedIndex: Math.max(prev.selectedIndex - 1, 0),
		}))
	}, [setSearchState])

	// Handle result navigation and selection (or load recent search)
	const handleSubmit = useCallback(() => {
		if (hasQuery) {
			const selectedResult = results[searchState.selectedIndex]
			if (selectedResult) {
				navigateToResult(selectedResult)
			}
		} else if (recentSearches.length > 0) {
			const selectedRecent = recentSearches[searchState.selectedIndex]
			if (selectedRecent) {
				loadRecentSearch(selectedRecent)
			}
		}
	}, [hasQuery, results, recentSearches, searchState.selectedIndex])

	// Navigate to a search result
	const navigateToResult = useCallback(
		(result: (typeof results)[0]) => {
			// Save to recent searches
			if (hasQuery) {
				const newSearch: RecentSearch = {
					query: searchState.query,
					filters: searchState.filters,
					timestamp: Date.now(),
				}
				setRecentSearches((prev) => {
					// Remove duplicates and add new search at front
					const filtered = prev.filter(
						(s) =>
							s.query !== newSearch.query ||
							JSON.stringify(s.filters) !== JSON.stringify(newSearch.filters),
					)
					return [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES)
				})
			}

			// Navigate to channel with messageId search param for deep linking
			navigate({
				to: "/$orgSlug/chat/$id",
				params: { orgSlug: orgSlug!, id: result.message.channelId },
				search: { messageId: result.message.id },
			})

			onClose()
		},
		[hasQuery, searchState.query, searchState.filters, setRecentSearches, navigate, orgSlug, onClose],
	)

	// Load a recent search
	const loadRecentSearch = useCallback(
		(recent: RecentSearch) => {
			const filterString = recent.filters
				.map((f) => `${f.type}:${f.value.includes(" ") ? `"${f.value}"` : f.value}`)
				.join(" ")
			const newInput = [filterString, recent.query].filter(Boolean).join(" ")

			setInputValue(newInput)
			setSearchState({
				query: recent.query,
				rawInput: newInput,
				filters: [...recent.filters],
				activeFilterType: null,
				activeFilterPartial: "",
				selectedIndex: 0,
			})

			editorRef.current?.focus()
		},
		[setSearchState],
	)

	// Clear search
	const clearSearch = useCallback(() => {
		setInputValue("")
		setSearchState(initialSearchState)
		editorRef.current?.focus()
	}, [setSearchState])

	return (
		<div className="flex max-h-[inherit] flex-col overflow-hidden">
			{/* Search Input */}
			<div className="flex items-center gap-2 border-b px-2.5 py-1">
				<IconMagnifier className="size-5 shrink-0 text-muted-fg" />

				{/* Filter Chips */}
				<SearchFilterChipGroup filters={searchState.filters} onRemove={removeFilter} />

				{/* Slate editor with syntax highlighting and autocomplete */}
				<SearchSlateEditor
					ref={editorRef}
					value={inputValue}
					onChange={handleInputChange}
					onSubmit={handleSubmit}
					onFilterSelect={handleFilterSelect}
					onArrowUp={handleArrowUp}
					onArrowDown={handleArrowDown}
					onBackspaceAtStart={handleBackspaceAtStart}
					placeholder={
						searchState.filters.length > 0
							? "Add more filters or search..."
							: "Search messages... (from:user in:channel has:image)"
					}
				/>

				{/* Clear / Loading */}
				{isLoading ? (
					<Loader className="size-4" variant="spin" />
				) : (
					(inputValue || searchState.filters.length > 0) && (
						<Button
							onPress={clearSearch}
							aria-label="Clear search"
							className="rounded p-1 text-muted-fg transition-colors hover:bg-secondary hover:text-fg"
						>
							<IconClose className="size-4" />
						</Button>
					)
				)}
			</div>

			{/* Content Area */}
			<div className="flex-1 overflow-y-auto p-2">
				{/* Search Results */}
				{hasQuery && (
					<>
						{results.length > 0 ? (
							<div className="space-y-1">
								{results.map((result, index) => (
									<SearchResultItem
										key={result.message.id}
										message={result.message}
										author={result.author}
										channel={result.channel}
										attachmentCount={result.attachmentCount}
										searchQuery={searchState.query}
										isSelected={index === searchState.selectedIndex}
										onSelect={() => navigateToResult(result)}
									/>
								))}
							</div>
						) : isEmpty ? (
							<EmptyState message="No messages found matching your search" />
						) : null}
					</>
				)}

				{/* Recent Searches (when no query) */}
				{!hasQuery && recentSearches.length > 0 && (
					<RecentSearchesList
						searches={recentSearches}
						selectedIndex={searchState.selectedIndex}
						onSelect={loadRecentSearch}
						onClear={() => setRecentSearches([])}
					/>
				)}

				{/* Initial State */}
				{!hasQuery && recentSearches.length === 0 && (
					<EmptyState message="Start typing to search messages across all channels" />
				)}
			</div>

			{/* Footer with keyboard hints */}
			<div className="flex-none border-t px-2 py-1.5 text-muted-fg text-xs">
				<span>
					<kbd className="mx-1 inline-grid h-4 min-w-4 place-content-center rounded-xs bg-secondary px-1">
						{"\u2191"}
					</kbd>
					<kbd className="mr-2 inline-grid h-4 min-w-4 place-content-center rounded-xs bg-secondary px-1">
						{"\u2193"}
					</kbd>
					to navigate
				</span>
				<span className="ml-3">
					<kbd className="mx-1 inline-grid h-4 min-w-4 place-content-center rounded-xs bg-secondary px-1">
						{"\u21B5"}
					</kbd>
					to select
				</span>
				<span className="ml-3">
					<kbd className="mx-1 inline-grid h-4 min-w-4 place-content-center rounded-xs bg-secondary px-1">
						esc
					</kbd>
					to close
				</span>
			</div>
		</div>
	)
}

/**
 * Recent searches list
 */
function RecentSearchesList({
	searches,
	selectedIndex,
	onSelect,
	onClear,
}: {
	searches: readonly RecentSearch[]
	selectedIndex: number
	onSelect: (search: RecentSearch) => void
	onClear: () => void
}) {
	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between px-2 py-1">
				<span className="text-muted-fg text-xs">Recent searches</span>
				<Button onPress={onClear} className="text-muted-fg text-xs transition-colors hover:text-fg">
					Clear all
				</Button>
			</div>
			{searches.map((search, index) => (
				<RecentSearchItem
					key={index}
					search={search}
					isSelected={index === selectedIndex}
					onSelect={() => onSelect(search)}
				/>
			))}
		</div>
	)
}

/**
 * Individual recent search item with scroll-into-view support
 */
function RecentSearchItem({
	search,
	isSelected,
	onSelect,
}: {
	search: RecentSearch
	isSelected: boolean
	onSelect: () => void
}) {
	const ref = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		if (isSelected && ref.current) {
			ref.current.scrollIntoView({ block: "nearest" })
		}
	}, [isSelected])

	return (
		<button
			ref={ref}
			type="button"
			onClick={onSelect}
			className={cn(
				"flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
				isSelected && "bg-secondary",
			)}
		>
			<span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
				{/* Render filters as badges */}
				{search.filters.map((f, i) => (
					<span
						key={i}
						className="inline-flex items-center gap-0.5 rounded-md bg-secondary px-1.5 py-0.5 text-xs ring-1 ring-inset ring-border"
					>
						<span className="text-muted-fg">{f.type}:</span>
						<span className="font-medium text-fg">{f.displayValue}</span>
					</span>
				))}
				{/* Render text query */}
				{search.query && <span className="truncate text-fg">{search.query}</span>}
			</span>
			<span className="shrink-0 text-muted-fg text-xs">
				{formatDistanceToNow(new Date(search.timestamp), { addSuffix: true })}
			</span>
		</button>
	)
}

/**
 * Empty state component
 */
function EmptyState({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-8 text-center">
			<IconMagnifier className="mb-3 size-8 text-muted-fg/50" />
			<p className="text-muted-fg text-sm">{message}</p>
		</div>
	)
}
