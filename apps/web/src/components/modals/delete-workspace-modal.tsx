import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { useState } from "react"
import { deleteOrganizationMutation } from "~/atoms/organization-atoms"
import IconWarning from "~/components/icons/icon-warning"
import { Button } from "~/components/ui/button"
import { Description, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { TextField } from "~/components/ui/text-field"
import { matchExitWithToast } from "~/lib/toast-exit"

interface DeleteWorkspaceModalProps {
	organizationId: OrganizationId
	organizationName: string
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	onDeleted: () => void
}

export function DeleteWorkspaceModal({
	organizationId,
	organizationName,
	isOpen,
	onOpenChange,
	onDeleted,
}: DeleteWorkspaceModalProps) {
	const [confirmationText, setConfirmationText] = useState("")

	const deleteOrganizationResult = useAtomValue(deleteOrganizationMutation)
	const deleteOrganization = useAtomSet(deleteOrganizationMutation, {
		mode: "promiseExit",
	})

	const isDeleting = deleteOrganizationResult.waiting
	const isConfirmed = confirmationText === organizationName

	const handleDelete = async () => {
		if (!isConfirmed) return

		const exit = await deleteOrganization({ payload: { id: organizationId } })

		matchExitWithToast(exit, {
			onSuccess: () => {
				setConfirmationText("")
				onOpenChange(false)
				onDeleted()
			},
			successMessage: "Workspace deleted successfully",
			customErrors: {
				OrganizationNotFoundError: () => ({
					title: "Workspace not found",
					description: "This workspace may have already been deleted.",
					isRetryable: false,
				}),
				UnauthorizedError: () => ({
					title: "Unauthorized",
					description: "You don't have permission to delete this workspace.",
					isRetryable: false,
				}),
			},
		})
	}

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setConfirmationText("")
		}
		onOpenChange(open)
	}

	return (
		<ModalContent isOpen={isOpen} onOpenChange={handleOpenChange} size="lg">
			<ModalHeader>
				<div className="flex items-center gap-2">
					<div className="flex size-10 items-center justify-center rounded-full bg-danger/10">
						<IconWarning className="size-5 text-danger" />
					</div>
					<ModalTitle>Delete workspace</ModalTitle>
				</div>
				<Description>
					This action <strong>cannot be undone</strong>. This will permanently delete the workspace{" "}
					<strong>{organizationName}</strong>, all channels, messages, and remove all member access.
				</Description>
			</ModalHeader>

			<ModalBody>
				<TextField className="w-full">
					<Label>
						Type <strong>{organizationName}</strong> to confirm
					</Label>
					<Input
						value={confirmationText}
						onChange={(e) => setConfirmationText(e.target.value)}
						placeholder={organizationName}
						autoComplete="off"
						autoCorrect="off"
						spellCheck={false}
					/>
				</TextField>
			</ModalBody>

			<ModalFooter>
				<Button intent="outline" onPress={() => handleOpenChange(false)} isDisabled={isDeleting}>
					Cancel
				</Button>
				<Button
					intent="danger"
					onPress={handleDelete}
					isDisabled={!isConfirmed || isDeleting}
					isPending={isDeleting}
				>
					{isDeleting ? "Deleting..." : "Delete workspace"}
				</Button>
			</ModalFooter>
		</ModalContent>
	)
}
