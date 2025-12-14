import type { ChannelCategoryId } from "@hazel/schema"
import { useCallback, useSyncExternalStore } from "react"

const STORAGE_PREFIX = "category-expanded-"

function getStorageKey(categoryId: ChannelCategoryId): string {
	return `${STORAGE_PREFIX}${categoryId}`
}

function getSnapshot(categoryId: ChannelCategoryId): boolean {
	if (typeof window === "undefined") return true
	const stored = localStorage.getItem(getStorageKey(categoryId))
	// Default to expanded (true) if not set
	return stored === null ? true : stored === "true"
}

function subscribe(categoryId: ChannelCategoryId, callback: () => void): () => void {
	const key = getStorageKey(categoryId)

	const handleStorage = (event: StorageEvent) => {
		if (event.key === key) {
			callback()
		}
	}

	window.addEventListener("storage", handleStorage)
	return () => window.removeEventListener("storage", handleStorage)
}

/**
 * Hook to manage category expanded/collapsed state in localStorage.
 * Each category's state is stored separately with key `category-expanded-{categoryId}`.
 * Defaults to expanded (true) when not set.
 */
export function useCategoryExpanded(categoryId: ChannelCategoryId): [boolean, (expanded: boolean) => void] {
	const isExpanded = useSyncExternalStore(
		useCallback((callback) => subscribe(categoryId, callback), [categoryId]),
		useCallback(() => getSnapshot(categoryId), [categoryId]),
		useCallback(() => true, []), // Server snapshot - default to expanded
	)

	const setExpanded = useCallback(
		(expanded: boolean) => {
			localStorage.setItem(getStorageKey(categoryId), String(expanded))
			// Trigger storage event for other tabs/hooks
			window.dispatchEvent(
				new StorageEvent("storage", {
					key: getStorageKey(categoryId),
					newValue: String(expanded),
				}),
			)
		},
		[categoryId],
	)

	return [isExpanded, setExpanded]
}
