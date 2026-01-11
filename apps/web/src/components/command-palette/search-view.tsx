"use client"

import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { ChannelId, UserId } from "@hazel/schema"
import { useNavigate } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button, Input, SearchField } from "react-aria-components"
import IconClose from "~/components/icons/icon-close"
import IconHashtag from "~/components/icons/icon-hashtag"
import IconMagnifier from "~/components/icons/icon-magnifier-3"
import { Avatar } from "~/components/ui/avatar"
import { Loader } from "~/components/ui/loader"
import { useOrganization } from "~/hooks/use-organization"
import { useChannelSuggestions, useSearchQuery, useUserSuggestions } from "~/hooks/use-search-query"
import { useAuth } from "~/lib/auth"
import { cn } from "~/lib/utils"
import {
	HAS_FILTER_VALUES,
	parseSearchInput,
	type FilterType,
	type SearchFilter,
} from "~/lib/search-filter-parser"
import {
	initialSearchState,
	MAX_RECENT_SEARCHES,
	recentSearchesAtom,
	searchStateAtom,
	type RecentSearch,
} from "~/atoms/search-atoms"
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
	const inputRef = useRef<HTMLInputElement>(null)

	// Focus input on mount
	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	// Search results
	const { results, isLoading, isEmpty, hasQuery } = useSearchQuery({
		query: searchState.query,
		filters: searchState.filters,
		organizationId: organizationId ?? null,
		userId: user?.id as UserId | undefined,
	})

	// Autocomplete suggestions
	const userSuggestions = useUserSuggestions(
		searchState.activeFilterType === "from" ? searchState.activeFilterPartial : "",
		organizationId ?? null,
	)

	const channelSuggestions = useChannelSuggestions(
		searchState.activeFilterType === "in" ? searchState.activeFilterPartial : "",
		organizationId ?? null,
		user?.id as UserId | undefined,
	)

	// Parse input and update search state
	const handleInputChange = useCallback(
		(value: string) => {
			setInputValue(value)

			const parsed = parseSearchInput(value)

			// Resolve any completed filters to actual IDs
			const resolvedFilters: SearchFilter[] = []
			for (const rawFilter of parsed.filters) {
				// Try to match against existing resolved filters first
				const existingFilter = searchState.filters.find(
					(f) => f.type === rawFilter.type && f.value === rawFilter.value,
				)
				if (existingFilter) {
					resolvedFilters.push(existingFilter)
				}
				// Note: New filters will need to be resolved through the autocomplete flow
			}

			setSearchState((prev) => ({
				...prev,
				rawInput: value,
				query: parsed.textQuery,
				activeFilterType: parsed.partialFilter?.type ?? null,
				activeFilterPartial: parsed.partialFilter?.partial ?? "",
				selectedIndex: 0,
			}))
		},
		[setSearchState, searchState.filters],
	)

	// Add a resolved filter
	const addFilter = useCallback(
		(filter: SearchFilter) => {
			setSearchState((prev) => {
				const newFilters = [...prev.filters, filter]
				// Remove the filter syntax from input
				const newInput = prev.rawInput
					.replace(new RegExp(`${filter.type}:${prev.activeFilterPartial}\\s*`, "i"), "")
					.trim()

				setInputValue(newInput)

				return {
					...prev,
					filters: newFilters,
					rawInput: newInput,
					activeFilterType: null,
					activeFilterPartial: "",
					selectedIndex: 0,
				}
			})

			// Refocus input
			inputRef.current?.focus()
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
			inputRef.current?.focus()
		},
		[setSearchState],
	)

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			const totalItems = searchState.activeFilterType ? getSuggestionCount() : results.length

			if (e.key === "ArrowDown") {
				e.preventDefault()
				setSearchState((prev) => ({
					...prev,
					selectedIndex: Math.min(prev.selectedIndex + 1, totalItems - 1),
				}))
			} else if (e.key === "ArrowUp") {
				e.preventDefault()
				setSearchState((prev) => ({
					...prev,
					selectedIndex: Math.max(prev.selectedIndex - 1, 0),
				}))
			} else if (e.key === "Enter") {
				e.preventDefault()
				if (searchState.activeFilterType) {
					selectSuggestion(searchState.selectedIndex)
				} else {
					const selectedResult = results[searchState.selectedIndex]
					if (selectedResult) {
						navigateToResult(selectedResult)
					}
				}
			} else if (e.key === "Backspace" && inputValue === "" && searchState.filters.length > 0) {
				// Remove last filter when backspace on empty input
				removeFilter(searchState.filters.length - 1)
			} else if (e.key === "Escape" && searchState.activeFilterType) {
				// Close suggestions first
				e.preventDefault()
				e.stopPropagation()
				setSearchState((prev) => ({
					...prev,
					activeFilterType: null,
					activeFilterPartial: "",
				}))
			}
		},
		[
			searchState.activeFilterType,
			searchState.selectedIndex,
			searchState.filters,
			results,
			inputValue,
			removeFilter,
			setSearchState,
		],
	)

	// Get suggestion count based on active filter type
	const getSuggestionCount = useCallback(() => {
		if (searchState.activeFilterType === "from") return userSuggestions.length
		if (searchState.activeFilterType === "in") return channelSuggestions.length
		if (searchState.activeFilterType === "has") return HAS_FILTER_VALUES.length
		return 0
	}, [searchState.activeFilterType, userSuggestions.length, channelSuggestions.length])

	// Select a suggestion
	const selectSuggestion = useCallback(
		(index: number) => {
			if (searchState.activeFilterType === "from" && userSuggestions[index]) {
				const user = userSuggestions[index]
				addFilter({
					type: "from",
					value: `${user.firstName} ${user.lastName}`.trim(),
					displayValue: `${user.firstName} ${user.lastName}`.trim(),
					id: user.id,
				})
			} else if (searchState.activeFilterType === "in" && channelSuggestions[index]) {
				const channel = channelSuggestions[index]
				addFilter({
					type: "in",
					value: channel.name,
					displayValue: channel.name,
					id: channel.id,
				})
			} else if (searchState.activeFilterType === "has" && HAS_FILTER_VALUES[index]) {
				const value = HAS_FILTER_VALUES[index]
				addFilter({
					type: "has",
					value,
					displayValue: value,
					id: value,
				})
			}
		},
		[searchState.activeFilterType, userSuggestions, channelSuggestions, addFilter],
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

			inputRef.current?.focus()
		},
		[setSearchState],
	)

	// Clear search
	const clearSearch = useCallback(() => {
		setInputValue("")
		setSearchState(initialSearchState)
		inputRef.current?.focus()
	}, [setSearchState])

	// Show suggestions based on active filter type
	const showSuggestions = searchState.activeFilterType !== null

	return (
		<div className="flex max-h-[inherit] flex-col overflow-hidden">
			{/* Search Input */}
			<div className="flex items-center gap-2 border-b px-2.5 py-1">
				<IconMagnifier className="size-5 shrink-0 text-muted-fg" />

				{/* Filter Chips */}
				<SearchFilterChipGroup filters={searchState.filters} onRemove={removeFilter} />

				{/* Input */}
				<SearchField
					aria-label="Search messages"
					className="flex-1"
					value={inputValue}
					onChange={setInputValue}
				>
					<Input
						ref={inputRef}
						placeholder={
							searchState.filters.length > 0
								? "Add more filters or search..."
								: "Search messages... (from:user in:channel has:image)"
						}
						className="w-full min-w-0 bg-transparent py-2 text-base text-fg placeholder-muted-fg outline-none focus:outline-none sm:py-1.5 sm:text-sm"
						onKeyDown={handleKeyDown}
						onChange={(e) => handleInputChange(e.target.value)}
					/>
				</SearchField>

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
				{/* Filter Suggestions */}
				{showSuggestions && (
					<FilterSuggestions
						type={searchState.activeFilterType!}
						partial={searchState.activeFilterPartial}
						selectedIndex={searchState.selectedIndex}
						userSuggestions={userSuggestions}
						channelSuggestions={channelSuggestions}
						onSelect={selectSuggestion}
					/>
				)}

				{/* Search Results */}
				{!showSuggestions && hasQuery && (
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
				{!showSuggestions && !hasQuery && recentSearches.length > 0 && (
					<RecentSearchesList
						searches={recentSearches}
						onSelect={loadRecentSearch}
						onClear={() => setRecentSearches([])}
					/>
				)}

				{/* Initial State */}
				{!showSuggestions && !hasQuery && recentSearches.length === 0 && (
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
 * Filter suggestions dropdown
 */
function FilterSuggestions({
	type,
	partial,
	selectedIndex,
	userSuggestions,
	channelSuggestions,
	onSelect,
}: {
	type: FilterType
	partial: string
	selectedIndex: number
	userSuggestions: ReturnType<typeof useUserSuggestions>
	channelSuggestions: ReturnType<typeof useChannelSuggestions>
	onSelect: (index: number) => void
}) {
	if (type === "from") {
		if (userSuggestions.length === 0) {
			return <EmptyState message={partial ? "No users found" : "Type to search users"} />
		}

		return (
			<div className="space-y-1">
				<div className="px-2 py-1 text-muted-fg text-xs">Select a user</div>
				{userSuggestions.map((user, index) => (
					<button
						key={user.id}
						type="button"
						onClick={() => onSelect(index)}
						className={cn(
							"flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
							"hover:bg-secondary focus:outline-none",
							index === selectedIndex && "bg-secondary",
						)}
					>
						<Avatar size="xs" src={user.avatarUrl ?? undefined} alt={user.firstName ?? ""} />
						<span className="font-medium">
							{user.firstName} {user.lastName}
						</span>
					</button>
				))}
			</div>
		)
	}

	if (type === "in") {
		if (channelSuggestions.length === 0) {
			return <EmptyState message={partial ? "No channels found" : "Type to search channels"} />
		}

		return (
			<div className="space-y-1">
				<div className="px-2 py-1 text-muted-fg text-xs">Select a channel</div>
				{channelSuggestions.map((channel, index) => (
					<button
						key={channel.id}
						type="button"
						onClick={() => onSelect(index)}
						className={cn(
							"flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
							"hover:bg-secondary focus:outline-none",
							index === selectedIndex && "bg-secondary",
						)}
					>
						<IconHashtag className="size-4 text-muted-fg" />
						<span className="font-medium">{channel.name}</span>
					</button>
				))}
			</div>
		)
	}

	if (type === "has") {
		const options = [
			{ value: "image", label: "Image", description: "Messages with images" },
			{ value: "file", label: "File", description: "Messages with file attachments" },
			{ value: "link", label: "Link", description: "Messages containing URLs" },
			{ value: "embed", label: "Embed", description: "Messages with rich embeds" },
		]

		return (
			<div className="space-y-1">
				<div className="px-2 py-1 text-muted-fg text-xs">Select attachment type</div>
				{options.map((option, index) => (
					<button
						key={option.value}
						type="button"
						onClick={() => onSelect(index)}
						className={cn(
							"flex w-full flex-col rounded-md px-2 py-1.5 text-left transition-colors",
							"hover:bg-secondary focus:outline-none",
							index === selectedIndex && "bg-secondary",
						)}
					>
						<span className="font-medium text-sm">{option.label}</span>
						<span className="text-muted-fg text-xs">{option.description}</span>
					</button>
				))}
			</div>
		)
	}

	// Date filters don't have suggestions
	return (
		<div className="px-2 py-4 text-center text-muted-fg text-sm">
			Enter a date (e.g., 2024-01-15, yesterday, lastweek)
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
