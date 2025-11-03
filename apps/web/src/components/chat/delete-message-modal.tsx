import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import { Button } from "~/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog"
import { Modal, ModalContent } from "~/components/ui/modal"

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
				<Dialog>
					<DialogHeader>
						<div className="flex size-12 items-center justify-center rounded-lg border border-danger/10 bg-danger/5">
							<ExclamationTriangleIcon className="size-6 text-danger" />
						</div>
						<DialogTitle>Delete message</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this message? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<DialogClose intent="secondary">Cancel</DialogClose>
						<Button intent="danger" onPress={handleDelete}>
							Delete message
						</Button>
					</DialogFooter>
				</Dialog>
			</ModalContent>
		</Modal>
	)
}
