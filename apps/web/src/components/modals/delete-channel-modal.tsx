import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelId } from "@hazel/schema"
import { Button } from "~/components/ui/button"
import { Description } from "~/components/ui/field"
import { ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { deleteChannelAction } from "~/db/actions"
import { matchExitWithToast } from "~/lib/toast-exit"

interface DeleteChannelModalProps {
	channelId: ChannelId
	channelName: string
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function DeleteChannelModal({
	channelId,
	channelName,
	isOpen,
	onOpenChange,
}: DeleteChannelModalProps) {
	const deleteChannel = useAtomSet(deleteChannelAction, {
		mode: "promiseExit",
	})

	const handleDelete = async () => {
		const exit = await deleteChannel({ channelId })

		matchExitWithToast(exit, {
			onSuccess: () => {
				onOpenChange(false)
			},
			successMessage: "Channel deleted successfully",
			customErrors: {
				ChannelNotFoundError: () => ({
					title: "Channel not found",
					description: "This channel may have already been deleted.",
					isRetryable: false,
				}),
			},
		})
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
				<Button intent="outline" onPress={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button intent="danger" onPress={handleDelete}>
					Delete
				</Button>
			</ModalFooter>
		</ModalContent>
	)
}
