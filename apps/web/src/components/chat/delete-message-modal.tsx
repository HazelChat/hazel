import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import { Button } from "~/components/ui/button"
import { Description } from "~/components/ui/field"
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"

interface DeleteMessageModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
}

export function DeleteMessageModal({ isOpen, onOpenChange, onConfirm }: DeleteMessageModalProps) {
	const handleDelete = () => {
		onConfirm()
		onOpenChange(false)
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="md">
				<ModalHeader>
					<div className="flex size-12 items-center justify-center rounded-lg border border-danger/10 bg-danger/5">
						<ExclamationTriangleIcon className="size-6 text-danger" />
					</div>
					<ModalTitle>Delete message</ModalTitle>
					<Description>
						Are you sure you want to delete this message? This action cannot be undone.
					</Description>
				</ModalHeader>

				<ModalFooter>
					<Button intent="outline" onPress={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button intent="danger" onPress={handleDelete}>
						Delete message
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
