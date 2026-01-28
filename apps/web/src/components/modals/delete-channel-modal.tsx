import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelId } from "@hazel/schema"
import { useMatchRoute, useNavigate, useParams } from "@tanstack/react-router"
import { Button } from "~/components/ui/button"
import { Description } from "~/components/ui/field"
import { ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { deleteChannelAction } from "~/db/actions"
import { exitToast } from "~/lib/toast-exit"

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
	const navigate = useNavigate()
	const matchRoute = useMatchRoute()
	const { orgSlug } = useParams({ strict: false }) as { orgSlug: string }

	const deleteChannel = useAtomSet(deleteChannelAction, {
		mode: "promiseExit",
	})

	const handleDelete = async () => {
		const exit = await deleteChannel({ channelId })

		exitToast(exit)
			.onSuccess(() => {
				const isOnDeletedChannel =
					matchRoute({
						to: "/$orgSlug/chat/$id",
						params: { orgSlug, id: channelId },
						fuzzy: true,
					}) ||
					matchRoute({
						to: "/$orgSlug/channels/$channelId/settings",
						params: { orgSlug, channelId },
						fuzzy: true,
					})

				if (isOnDeletedChannel) {
					navigate({ to: "/$orgSlug/chat", params: { orgSlug } })
				}
				onOpenChange(false)
			})
			.successMessage("Channel deleted successfully")
			.onErrorTag("ChannelNotFoundError", () => ({
				title: "Channel not found",
				description: "This channel may have already been deleted.",
				isRetryable: false,
			}))
			.run()
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
