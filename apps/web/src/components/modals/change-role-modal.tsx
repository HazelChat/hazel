import type { OrganizationMemberId, UserId } from "@hazel/schema"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { useModal } from "~/atoms/modal-atoms"
import { Button } from "~/components/ui/button"
import { Description, Label } from "~/components/ui/field"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
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
	const { isOpen, metadata: rawMetadata, close } = useModal("change-role")
	const metadata = rawMetadata as ChangeRoleMetadata | undefined

	const [selectedRole, setSelectedRole] = useState(metadata?.role ?? "member")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleClose = useCallback(() => {
		close()
	}, [close])

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
		<Modal isOpen={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<ModalContent key={metadata.userId} size="md">
				<ModalHeader>
					<ModalTitle>Change role for {metadata.name}</ModalTitle>
					<Description>Select a new role for this team member</Description>
				</ModalHeader>

				<ModalBody>
					<div className="flex flex-col gap-2">
						<Label>Role</Label>
						<RadioGroup value={selectedRole} onChange={setSelectedRole}>
							{roleOptions.map((option) => (
								<Radio key={option.value} value={option.value} isDisabled={option.disabled}>
									<Label>{option.label}</Label>
									<Description>{option.description}</Description>
								</Radio>
							))}
						</RadioGroup>
					</div>
				</ModalBody>

				<ModalFooter>
					<Button intent="outline" onPress={handleClose} isDisabled={isSubmitting}>
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
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
