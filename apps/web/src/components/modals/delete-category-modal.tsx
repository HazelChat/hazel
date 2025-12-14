import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelCategory } from "@hazel/db/schema"
import { Button } from "~/components/ui/button"
import { Description } from "~/components/ui/field"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { deleteChannelCategoryAction } from "~/db/actions"
import { matchExitWithToast } from "~/lib/toast-exit"

interface DeleteCategoryModalProps {
	category: Omit<ChannelCategory, "updatedAt"> & { updatedAt: Date | null }
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function DeleteCategoryModal({ category, isOpen, onOpenChange }: DeleteCategoryModalProps) {
	const deleteCategory = useAtomSet(deleteChannelCategoryAction, { mode: "promiseExit" })

	const handleDelete = async () => {
		const exit = await deleteCategory({ categoryId: category.id })

		matchExitWithToast(exit, {
			onSuccess: () => {
				onOpenChange(false)
			},
			successMessage: "Category deleted successfully",
			customErrors: {
				ChannelCategoryNotFoundError: () => ({
					title: "Category not found",
					description: "This category may have already been deleted.",
					isRetryable: false,
				}),
			},
		})
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Delete category</ModalTitle>
					<Description>
						Are you sure you want to delete <strong>{category.name}</strong>? Channels in this
						category will be moved to uncategorized.
					</Description>
				</ModalHeader>

				<ModalBody />

				<ModalFooter>
					<Button intent="outline" onPress={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button intent="danger" onPress={handleDelete}>
						Delete
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
