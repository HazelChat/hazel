import { useCallback, useMemo, useState } from "react"

/**
 * Hook for managing multiple modal states in a component.
 *
 * Instead of creating multiple useState calls for each modal:
 * ```tsx
 * const [deleteModalOpen, setDeleteModalOpen] = useState(false)
 * const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
 * const [renameModalOpen, setRenameModalOpen] = useState(false)
 * ```
 *
 * Use this hook:
 * ```tsx
 * const modal = useModalState(['delete', 'emoji', 'rename'] as const)
 *
 * // Check if a modal is open
 * modal.isOpen('delete') // boolean
 *
 * // Open a modal (closes any other open modal)
 * modal.open('delete')
 *
 * // Close the current modal
 * modal.close()
 *
 * // Use with a Modal component
 * <DeleteModal isOpen={modal.isOpen('delete')} onOpenChange={(open) => open ? modal.open('delete') : modal.close()} />
 * ```
 *
 * @param _modals - Array of modal names (used for type inference)
 * @returns Object with isOpen, open, and close methods
 */
export function useModalState<T extends string>(_modals: readonly T[]) {
	const [openModal, setOpenModal] = useState<T | null>(null)

	const isOpen = useCallback((modal: T) => openModal === modal, [openModal])

	const open = useCallback((modal: T) => setOpenModal(modal), [])

	const close = useCallback(() => setOpenModal(null), [])

	/**
	 * Handler for modal onOpenChange that properly handles both open and close
	 */
	const getOpenChangeHandler = useCallback(
		(modal: T) => (isOpen: boolean) => {
			if (isOpen) {
				setOpenModal(modal)
			} else {
				setOpenModal(null)
			}
		},
		[],
	)

	return useMemo(
		() => ({
			isOpen,
			open,
			close,
			/** Currently open modal (or null if none) */
			current: openModal,
			/** Get an onOpenChange handler for a specific modal */
			getOpenChangeHandler,
		}),
		[isOpen, open, close, openModal, getOpenChangeHandler],
	)
}

/**
 * Simplified version that tracks a single modal open/close state.
 * Useful when a component only has one modal.
 *
 * @example
 * ```tsx
 * const deleteModal = useSingleModalState()
 *
 * <Button onPress={deleteModal.open}>Delete</Button>
 * <DeleteModal isOpen={deleteModal.isOpen} onOpenChange={deleteModal.setIsOpen} />
 * ```
 */
export function useSingleModalState(initialState = false) {
	const [isOpen, setIsOpen] = useState(initialState)

	const open = useCallback(() => setIsOpen(true), [])
	const close = useCallback(() => setIsOpen(false), [])
	const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

	return useMemo(
		() => ({
			isOpen,
			setIsOpen,
			open,
			close,
			toggle,
		}),
		[isOpen, open, close, toggle],
	)
}
