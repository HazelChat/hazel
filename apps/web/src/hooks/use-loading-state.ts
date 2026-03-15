import { useAtomValue } from "@effect/atom-react"
import { useCallback, useMemo } from "react"
import {
	canLoadBottomAtomFamily,
	canLoadTopAtomFamily,
	finishLoading as finishLoadingAtom,
	isLoadingAtomFamily,
	type LoadingState,
	loadingStateAtomFamily,
	startLoadingBottom as startLoadingBottomAtom,
	startLoadingTop as startLoadingTopAtom,
} from "~/atoms/loading-state-atoms"

interface UseLoadingStateReturn {
	canLoadTop: boolean
	canLoadBottom: boolean
	startLoadingTop: () => boolean
	startLoadingBottom: () => boolean
	finishLoading: () => void
	isLoading: boolean
	loadingState: LoadingState
}

interface UseLoadingStateOptions {
	/**
	 * Unique identifier for this loading state instance
	 * Allows multiple components to have isolated loading states
	 * @default "default"
	 */
	id?: string
}

/**
 * Hook for managing loading states with cooldown period
 * Uses effect-atom for state management
 *
 * @example
 * ```tsx
 * const { startLoadingTop, finishLoading, isLoading } = useLoadingState({ id: 'message-list' })
 *
 * const loadMore = async () => {
 *   if (!startLoadingTop()) return
 *   await fetchMessages()
 *   finishLoading()
 * }
 * ```
 */
export function useLoadingState(options: UseLoadingStateOptions = {}): UseLoadingStateReturn {
	const id = options.id ?? "default"

	// Read state from atoms
	const loadingState = useAtomValue(loadingStateAtomFamily(id))
	const canLoadTop = useAtomValue(canLoadTopAtomFamily(id))
	const canLoadBottom = useAtomValue(canLoadBottomAtomFamily(id))
	const isLoading = useAtomValue(isLoadingAtomFamily(id))

	// Create stable callbacks that use the id
	const startLoadingTop = useCallback(() => {
		return startLoadingTopAtom(id)
	}, [id])

	const startLoadingBottom = useCallback(() => {
		return startLoadingBottomAtom(id)
	}, [id])

	const finishLoading = useCallback(() => {
		finishLoadingAtom(id)
	}, [id])

	return useMemo(
		() => ({
			canLoadTop,
			canLoadBottom,
			startLoadingTop,
			startLoadingBottom,
			finishLoading,
			isLoading,
			loadingState,
		}),
		[
			canLoadTop,
			canLoadBottom,
			startLoadingTop,
			startLoadingBottom,
			finishLoading,
			isLoading,
			loadingState,
		],
	)
}
