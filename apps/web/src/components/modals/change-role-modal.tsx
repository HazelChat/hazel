import { useAtomValue } from "@effect-atom/atom-react"
import type { OrganizationMemberId, UserId } from "@hazel/db/schema"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { closeModal, modalAtomFamily } from "~/atoms/modal-atoms"
import { Button } from "~/components/ui/button"
import {
	Dialog,
	DialogBody,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog"
import { Description, Label } from "~/components/ui/field"
import { Modal, ModalContent } from "~/components/ui/modal"
import { Radio, RadioGroup } from "~/components/ui/radio"
import { organizationMemberCollection } from "~/db/collections"

interface ChangeRoleMetadata {
	userId: UserId
	memberId: OrganizationMemberId
	name: string
	role: string
	currentUserRole: string
}

export function ChangeRoleModal() {
	const modalState = useAtomValue(modalAtomFamily("change-role"))
	const metadata = modalState.metadata as ChangeRoleMetadata | undefined

	const [selectedRole, setSelectedRole] = useState(metadata?.role ?? "member")
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Reset selected role when modal opens with new metadata
	useEffect(() => {
		if (modalState.isOpen && metadata?.role) {
			setSelectedRole(metadata.role)
		}
	}, [modalState.isOpen, metadata?.role])

	const handleClose = useCallback(() => {
		closeModal("change-role")
	}, [])

	const handleSubmit = useCallback(async () => {
		if (!metadata) return

		if (selectedRole === metadata.role) {
			handleClose()
			return
		}

		setIsSubmitting(true)
		try {
			const tx = organizationMemberCollection.update(metadata.memberId, (draft) => {
				draft.role = selectedRole as "member" | "admin" | "owner"
			})

			await toast
				.promise(tx.isPersisted.promise, {
					loading: "Updating role...",
					success: `${metadata.name}'s role has been updated to ${selectedRole}`,
					error: "Failed to update role",
				})
				.unwrap()

			handleClose()
		} finally {
			setIsSubmitting(false)
		}
	}, [selectedRole, metadata, handleClose])

	const roleOptions = [
		{ value: "member", label: "Member", description: "Can view and participate in channels" },
		{ value: "admin", label: "Admin", description: "Can manage members and settings" },
		{
			value: "owner",
			label: "Owner",
			description: "Full control over the organization",
			disabled: metadata?.currentUserRole !== "owner",
		},
	]

	if (!metadata) return null

	return (
		<Modal>
			<ModalContent
				isOpen={modalState.isOpen}
				onOpenChange={(open) => !open && handleClose()}
				size="md"
			>
				<Dialog>
					<DialogHeader>
						<DialogTitle>Change role for {metadata.name}</DialogTitle>
						<DialogDescription>Select a new role for this team member</DialogDescription>
					</DialogHeader>

					<DialogBody>
						<div className="space-y-2">
							<Label>Role</Label>
							<RadioGroup value={selectedRole} onChange={setSelectedRole}>
								{roleOptions.map((option) => (
									<Radio
										key={option.value}
										value={option.value}
										isDisabled={option.disabled}
									>
										<Label>{option.label}</Label>
										<Description>{option.description}</Description>
									</Radio>
								))}
							</RadioGroup>
						</div>
					</DialogBody>

					<DialogFooter>
						<Button intent="secondary" onPress={handleClose} isDisabled={isSubmitting}>
							Cancel
						</Button>
						<Button
							intent="primary"
							onPress={handleSubmit}
							isDisabled={isSubmitting || selectedRole === metadata.role}
							isPending={isSubmitting}
						>
							{isSubmitting ? "Updating..." : "Update role"}
						</Button>
					</DialogFooter>
				</Dialog>
			</ModalContent>
		</Modal>
	)
}
