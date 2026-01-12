"use client"

import type { UserId } from "@hazel/schema"
import { pipe } from "effect"
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { createEditor, Editor, Node, Range, Text, Transforms, type Descendant } from "slate"
import { withHistory } from "slate-history"
import { Editable, ReactEditor, Slate, withReact, type RenderLeafProps } from "slate-react"
import { Avatar } from "~/components/ui/avatar"
import IconHashtag from "~/components/icons/icon-hashtag"
import { useChannelSuggestions, useUserSuggestions } from "~/hooks/use-search-query"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import { cn } from "~/lib/utils"
import { HAS_FILTER_VALUES, type FilterType, type SearchFilter } from "~/lib/search-filter-parser"
import { decorateSearchFilters, SearchFilterLeaf } from "./search-filter-decorator"

// Filter autocomplete state
interface FilterAutocompleteState {
	isOpen: boolean
	filterType: FilterType | null
	search: string
	activeIndex: number
	// Position in text where the filter keyword starts
	filterStartOffset: number | null
}

const initialAutocompleteState: FilterAutocompleteState = {
	isOpen: false,
	filterType: null,
	search: "",
	activeIndex: 0,
	filterStartOffset: null,
}

export interface SearchSlateEditorProps {
	value: string
	onChange: (value: string) => void
	onSubmit?: () => void
	onFilterSelect?: (filter: SearchFilter) => void
	onArrowUp?: () => void
	onArrowDown?: () => void
	onBackspaceAtStart?: () => void
	placeholder?: string
	className?: string
}

export interface SearchSlateEditorRef {
	focus: () => void
	blur: () => void
}

/**
 * Single-line Slate editor for search with filter syntax highlighting and autocomplete
 */
export const SearchSlateEditor = forwardRef<SearchSlateEditorRef, SearchSlateEditorProps>(
	(
		{
			value,
			onChange,
			onSubmit,
			onFilterSelect,
			onArrowUp,
			onArrowDown,
			onBackspaceAtStart,
			placeholder,
			className,
		},
		ref,
	) => {
		const { organizationId } = useOrganization()
		const { user } = useAuth()
		const editorRef = useRef<ReturnType<typeof createEditor> | null>(null)

		// Create editor once
		const editor = useMemo(() => {
			if (editorRef.current) return editorRef.current
			const e = pipe(createEditor(), withHistory, withReact, withSingleLine)
			editorRef.current = e
			return e
		}, [])

		// Autocomplete state
		const [autocomplete, setAutocomplete] = useState<FilterAutocompleteState>(initialAutocompleteState)

		// Get suggestions based on filter type
		const userSuggestions = useUserSuggestions(
			autocomplete.filterType === "from" ? autocomplete.search : "",
			organizationId ?? null,
		)

		const channelSuggestions = useChannelSuggestions(
			autocomplete.filterType === "in" ? autocomplete.search : "",
			organizationId ?? null,
			user?.id as UserId | undefined,
		)

		// Get current suggestions based on filter type
		const currentSuggestions = useMemo(() => {
			if (autocomplete.filterType === "from") {
				return userSuggestions.map((u) => ({
					id: u.id,
					label: `${u.firstName} ${u.lastName}`.trim(),
					avatarUrl: u.avatarUrl,
					type: "user" as const,
				}))
			}
			if (autocomplete.filterType === "in") {
				return channelSuggestions.map((c) => ({
					id: c.id,
					label: c.name,
					type: "channel" as const,
				}))
			}
			if (autocomplete.filterType === "has") {
				return HAS_FILTER_VALUES.filter((v) =>
					v.toLowerCase().includes(autocomplete.search.toLowerCase()),
				).map((v) => ({
					id: v,
					label: v,
					type: "has" as const,
				}))
			}
			return []
		}, [autocomplete.filterType, autocomplete.search, userSuggestions, channelSuggestions])

		// Expose focus/blur methods
		useImperativeHandle(ref, () => ({
			focus: () => ReactEditor.focus(editor),
			blur: () => ReactEditor.blur(editor),
		}))

		// Convert string value to Slate content
		const slateValue: Descendant[] = useMemo(
			() => [{ type: "paragraph", children: [{ text: value }] }],
			[value],
		)

		// Handle Slate changes
		const handleChange = useCallback(
			(newValue: Descendant[]) => {
				// Extract plain text from Slate content
				const text = newValue.map((n) => Node.string(n)).join("")
				onChange(text)

				// Check for filter autocomplete triggers
				const { selection } = editor
				if (selection && Range.isCollapsed(selection)) {
					const [start] = Range.edges(selection)
					const textBefore = Editor.string(editor, {
						anchor: { path: start.path, offset: 0 },
						focus: start,
					})

					// Check if we just typed a colon after a filter keyword
					const filterMatch = /\b(from|in|has|before|after):([^:\s]*)$/i.exec(textBefore)

					if (filterMatch) {
						const filterType = filterMatch[1]?.toLowerCase() as FilterType
						const search = filterMatch[2] ?? ""
						const filterStartOffset = textBefore.length - filterMatch[0].length

						// Only show autocomplete for from, in, has (not date filters)
						if (["from", "in", "has"].includes(filterType)) {
							setAutocomplete({
								isOpen: true,
								filterType,
								search,
								activeIndex: 0,
								filterStartOffset,
							})
							return
						}
					}

					// Close autocomplete if no match
					if (autocomplete.isOpen) {
						setAutocomplete(initialAutocompleteState)
					}
				}
			},
			[editor, onChange, autocomplete.isOpen],
		)

		// Handle selecting an autocomplete option
		const selectOption = useCallback(
			(option: (typeof currentSuggestions)[0]) => {
				if (autocomplete.filterStartOffset === null || !autocomplete.filterType) return

				const { selection } = editor
				if (!selection) return

				// Get current text
				const [start] = Range.edges(selection)
				const textNode = Editor.string(editor, {
					anchor: { path: start.path, offset: 0 },
					focus: start,
				})

				// Calculate range to delete (filter keyword + search term)
				const replaceStart = autocomplete.filterStartOffset
				const replaceEnd = textNode.length

				// Delete the filter text from the editor (e.g., "from:dav")
				Transforms.select(editor, {
					anchor: { path: start.path, offset: replaceStart },
					focus: { path: start.path, offset: replaceEnd },
				})
				Transforms.delete(editor)

				// Notify parent about the selected filter with entity ID
				if (onFilterSelect) {
					onFilterSelect({
						type: autocomplete.filterType,
						value: option.label,
						displayValue: option.label,
						id: option.id,
					})
				}

				// Close autocomplete
				setAutocomplete(initialAutocompleteState)

				// Refocus editor
				ReactEditor.focus(editor)
			},
			[editor, autocomplete, onFilterSelect],
		)

		// Handle keyboard navigation
		const handleKeyDown = useCallback(
			(event: React.KeyboardEvent) => {
				// Handle autocomplete navigation
				if (autocomplete.isOpen && currentSuggestions.length > 0) {
					switch (event.key) {
						case "ArrowDown":
							event.preventDefault()
							setAutocomplete((prev) => ({
								...prev,
								activeIndex: (prev.activeIndex + 1) % currentSuggestions.length,
							}))
							return
						case "ArrowUp":
							event.preventDefault()
							setAutocomplete((prev) => ({
								...prev,
								activeIndex:
									prev.activeIndex <= 0
										? currentSuggestions.length - 1
										: prev.activeIndex - 1,
							}))
							return
						case "Enter":
						case "Tab":
							event.preventDefault()
							const selected = currentSuggestions[autocomplete.activeIndex]
							if (selected) {
								selectOption(selected)
							}
							return
						case "Escape":
							event.preventDefault()
							setAutocomplete(initialAutocompleteState)
							return
					}
				}

				// Handle Backspace at start of input to delete last filter
				if (event.key === "Backspace" && !autocomplete.isOpen) {
					const { selection } = editor
					if (selection && Range.isCollapsed(selection)) {
						const [start] = Range.edges(selection)
						// Check if cursor is at the very beginning (offset 0)
						if (start.offset === 0) {
							onBackspaceAtStart?.()
							return
						}
					}
				}

				// Forward arrow keys to parent for result navigation (when autocomplete is closed)
				if (!autocomplete.isOpen) {
					if (event.key === "ArrowDown") {
						event.preventDefault()
						onArrowDown?.()
						return
					}
					if (event.key === "ArrowUp") {
						event.preventDefault()
						onArrowUp?.()
						return
					}
				}

				// Submit on Enter (when autocomplete is closed)
				if (event.key === "Enter" && !autocomplete.isOpen) {
					event.preventDefault()
					onSubmit?.()
				}
			},
			[
				autocomplete,
				currentSuggestions,
				selectOption,
				onSubmit,
				onArrowUp,
				onArrowDown,
				onBackspaceAtStart,
				editor,
			],
		)

		// Decorate function for syntax highlighting
		const decorate = useCallback((entry: [any, number[]]) => {
			const [node, path] = entry
			if (Text.isText(node)) {
				return decorateSearchFilters([node, path])
			}
			return []
		}, [])

		// Render leaf with highlighting
		const renderLeaf = useCallback((props: RenderLeafProps) => {
			return <SearchFilterLeaf {...props} />
		}, [])

		// Clamp active index when suggestions change
		useEffect(() => {
			if (autocomplete.activeIndex >= currentSuggestions.length && currentSuggestions.length > 0) {
				setAutocomplete((prev) => ({ ...prev, activeIndex: currentSuggestions.length - 1 }))
			}
		}, [currentSuggestions.length, autocomplete.activeIndex])

		return (
			<div className={cn("relative min-w-0 flex-1", className)}>
				<Slate editor={editor} initialValue={slateValue} onChange={handleChange}>
					<Editable
						decorate={decorate}
						renderLeaf={renderLeaf}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						className="w-full truncate bg-transparent py-2 text-base text-fg outline-none sm:py-1.5 sm:text-sm [&_[data-slate-placeholder]]:truncate [&_[data-slate-placeholder]]:!opacity-100 [&_[data-slate-placeholder]]:text-muted-fg [&_[data-slate-placeholder]]:text-xs [&_[data-slate-placeholder]]:!top-1/2 [&_[data-slate-placeholder]]:!-translate-y-1/2"
					/>
				</Slate>

				{/* Autocomplete dropdown */}
				{autocomplete.isOpen && currentSuggestions.length > 0 && (
					<div className="fade-in slide-in-from-top-2 animate-in absolute top-full left-0 z-50 mt-1 w-64 overflow-hidden rounded-xl border border-fg/10 bg-overlay text-overlay-fg shadow-lg duration-150">
						<div className="border-b border-fg/5 px-3 py-2 text-muted-fg text-xs">
							{autocomplete.filterType === "from" && "Select a user"}
							{autocomplete.filterType === "in" && "Select a channel"}
							{autocomplete.filterType === "has" && "Select attachment type"}
						</div>
						<div className="p-1">
							{currentSuggestions.map((option, index) => (
								<button
									key={option.id}
									type="button"
									onMouseDown={(e) => {
										e.preventDefault() // Prevent focus loss
										selectOption(option)
									}}
									onMouseEnter={() =>
										setAutocomplete((prev) => ({ ...prev, activeIndex: index }))
									}
									className={cn(
										"flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors",
										index === autocomplete.activeIndex
											? "bg-primary/10 text-primary"
											: "hover:bg-muted",
									)}
								>
									{option.type === "user" && (
										<Avatar
											size="xs"
											src={(option as any).avatarUrl ?? undefined}
											alt={option.label}
										/>
									)}
									{option.type === "channel" && (
										<IconHashtag className="size-4 text-muted-fg" />
									)}
									<span className="truncate font-medium">{option.label}</span>
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		)
	},
)

SearchSlateEditor.displayName = "SearchSlateEditor"

/**
 * Plugin to make Slate single-line (prevent Enter from creating new lines)
 */
function withSingleLine<T extends Editor>(editor: T): T {
	const { insertBreak } = editor

	editor.insertBreak = () => {
		// Do nothing on Enter - we handle submit separately
	}

	return editor
}
