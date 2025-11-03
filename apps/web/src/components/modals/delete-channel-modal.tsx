import { Button } from "~/components/ui/button"
import { Description } from "~/components/ui/field"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"

interface DeleteChannelModalProps {
	channelName: string
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
}

export function DeleteChannelModal({
	channelName,
	isOpen,
	onOpenChange,
	onConfirm,
}: DeleteChannelModalProps) {
	const handleDelete = () => {
		onConfirm()
		onOpenChange(false)
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Delete channel</ModalTitle>
					<Description>
						Are you sure you want to delete <strong>#{channelName}</strong>? This action cannot be
						undone and all messages will be permanently deleted.
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
