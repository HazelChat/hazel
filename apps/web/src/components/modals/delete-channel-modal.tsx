import { buttonStyles } from "~/components/ui/button"
import { Description } from "~/components/ui/field"
import { ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"

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
		<ModalContent isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
			<ModalHeader>
				<ModalTitle>Delete channel</ModalTitle>
				<Description>
					Are you sure you want to delete <strong>#{channelName}</strong>? This action cannot be
					undone and all messages will be permanently deleted.
				</Description>
			</ModalHeader>

			<ModalFooter>
				<button
					type="button"
					className={buttonStyles({ intent: "outline" })}
					onClick={() => onOpenChange(false)}
				>
					Cancel
				</button>
				<button type="button" className={buttonStyles({ intent: "danger" })} onClick={handleDelete}>
					Delete
				</button>
			</ModalFooter>
		</ModalContent>
	)
}
