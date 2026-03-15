import { useAtomSet, useAtomValue } from "@effect/atom-react"
import { useCallback } from "react"
import {
	type CommandPalettePageType,
	type CommandPaletteState,
	type CreateChannelPageState,
	type HistoryEntry,
	type JoinChannelPageState,
	type PageState,
	type SearchPageState,
	commandPaletteStateAtom,
	initialCommandPaletteState,
	initialPageStates,
} from "~/atoms/command-palette-state"

/**
 * Page state updater type - accepts partial updates for the specific page type
 */
export type PageStateUpdater<T extends PageState> = (prev: T) => Partial<T>

/**
 * Hook for command palette state management
 * Provides actions to open, close, navigate, and update page state
 */
export function useCommandPalette() {
	const state = useAtomValue(commandPaletteStateAtom)
	const setState = useAtomSet(commandPaletteStateAtom)

	/**
	 * Open the command palette with an optional initial page
	 * Resets all state to fresh defaults
	 */
	const open = useCallback(
		(initialPage: CommandPalettePageType = "home") => {
			setState({
				isOpen: true,
				currentPage: { ...initialPageStates[initialPage] },
				pageHistory: [],
			})
		},
		[setState],
	)

	/**
	 * Close the command palette and reset all state
	 */
	const close = useCallback(() => {
		setState(initialCommandPaletteState)
	}, [setState])

	/**
	 * Navigate to a new page with fresh state
	 * Pushes current page to history for back navigation
	 */
	const navigateTo = useCallback(
		(pageType: CommandPalettePageType) => {
			setState((prev) => ({
				...prev,
				currentPage: { ...initialPageStates[pageType] },
				pageHistory: [...prev.pageHistory, { pageState: prev.currentPage }],
			}))
		},
		[setState],
	)

	/**
	 * Go back to the previous page in history
	 * Restores the previous page's state
	 */
	const goBack = useCallback(() => {
		setState((prev) => {
			if (prev.pageHistory.length === 0) return prev

			const lastEntry = prev.pageHistory[prev.pageHistory.length - 1]
			return {
				...prev,
				currentPage: lastEntry!.pageState,
				pageHistory: prev.pageHistory.slice(0, -1),
			}
		})
	}, [setState])

	/**
	 * Check if we can go back (for ESC key handling)
	 */
	const canGoBack = state.pageHistory.length > 0

	/**
	 * Update state for search page
	 */
	const updateSearchState = useCallback(
		(updater: PageStateUpdater<SearchPageState>) => {
			setState((prev) => {
				if (prev.currentPage.type !== "search") return prev
				const updates = updater(prev.currentPage)
				return {
					...prev,
					currentPage: { ...prev.currentPage, ...updates },
				}
			})
		},
		[setState],
	)

	/**
	 * Update state for create-channel page
	 */
	const updateCreateChannelState = useCallback(
		(updater: PageStateUpdater<CreateChannelPageState>) => {
			setState((prev) => {
				if (prev.currentPage.type !== "create-channel") return prev
				const updates = updater(prev.currentPage)
				return {
					...prev,
					currentPage: { ...prev.currentPage, ...updates },
				}
			})
		},
		[setState],
	)

	/**
	 * Update state for join-channel page
	 */
	const updateJoinChannelState = useCallback(
		(updater: PageStateUpdater<JoinChannelPageState>) => {
			setState((prev) => {
				if (prev.currentPage.type !== "join-channel") return prev
				const updates = updater(prev.currentPage)
				return {
					...prev,
					currentPage: { ...prev.currentPage, ...updates },
				}
			})
		},
		[setState],
	)

	/**
	 * Update input value for list pages (home, status, appearance)
	 */
	const updateInputValue = useCallback(
		(value: string) => {
			setState((prev) => {
				const page = prev.currentPage
				if (page.type === "home" || page.type === "status" || page.type === "appearance") {
					return {
						...prev,
						currentPage: { ...page, inputValue: value },
					}
				}
				return prev
			})
		},
		[setState],
	)

	/**
	 * Set isOpen state directly (for controlled component pattern)
	 */
	const setIsOpen = useCallback(
		(isOpen: boolean) => {
			if (isOpen) {
				// Opening - reset to fresh home state
				open("home")
			} else {
				// Closing - reset everything
				close()
			}
		},
		[open, close],
	)

	return {
		// State
		isOpen: state.isOpen,
		currentPage: state.currentPage,
		pageHistory: state.pageHistory,
		canGoBack,

		// Actions
		open,
		close,
		navigateTo,
		goBack,
		setIsOpen,

		// Page-specific state updaters
		updateSearchState,
		updateCreateChannelState,
		updateJoinChannelState,
		updateInputValue,
	}
}

/**
 * Hook for reading command palette state without actions
 * Use this for components that only need to observe state
 */
export function useCommandPaletteState(): CommandPaletteState {
	return useAtomValue(commandPaletteStateAtom)
}
