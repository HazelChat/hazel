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

	// Handle result navigation and selection
	const handleSubmit = useCallback(() => {
		const selectedResult = results[searchState.selectedIndex]
		if (selectedResult) {
			navigateToResult(selectedResult)
		}
	}, [results, searchState.selectedIndex])

	// Keyboard navigation for results (when not in autocomplete mode)
	const handleResultsKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				e.preventDefault()
				setSearchState((prev) => ({
					...prev,
					selectedIndex: Math.min(prev.selectedIndex + 1, results.length - 1),
				}))
			} else if (e.key === "ArrowUp") {
				e.preventDefault()
				setSearchState((prev) => ({
					...prev,
					selectedIndex: Math.max(prev.selectedIndex - 1, 0),
				}))
			}
		},
		[results.length, setSearchState],
	)

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

			// Navigate to channel
			navigate({
				to: "/$orgSlug/chat/$id",
				params: { orgSlug: orgSlug!, id: result.message.channelId },
			})

			onClose()

			// Scroll to message after navigation
			setTimeout(() => {
				const element = document.getElementById(`message-${result.message.id}`)
				if (element) {
					element.scrollIntoView({ behavior: "smooth", block: "center" })
					element.classList.add("bg-secondary/30")
					setTimeout(() => element.classList.remove("bg-secondary/30"), 2000)
				}
			}, 100)
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
			<div className="flex-1 overflow-y-auto p-2" onKeyDown={handleResultsKeyDown}>
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
	onSelect,
	onClear,
}: {
	searches: readonly RecentSearch[]
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
			{searches.map((search, index) => {
				const displayText = [
					...search.filters.map((f) => `${f.type}:${f.displayValue}`),
					search.query,
				]
					.filter(Boolean)
					.join(" ")

				return (
					<button
						key={index}
						type="button"
						onClick={() => onSelect(search)}
						className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary"
					>
						<span className="truncate text-fg">{displayText}</span>
						<span className="shrink-0 text-muted-fg text-xs">
							{formatDistanceToNow(new Date(search.timestamp), { addSuffix: true })}
						</span>
					</button>
				)
			})}
		</div>
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
