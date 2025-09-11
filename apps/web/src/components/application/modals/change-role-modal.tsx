import type { OrganizationMemberId, UserId } from "@hazel/db/schema"
import { User02 } from "@untitledui/icons"
import { useCallback, useState } from "react"
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components"
import { toast } from "sonner"
import { Button } from "~/components/base/buttons/button"
import { CloseButton } from "~/components/base/buttons/close-button"
import { Label } from "~/components/base/input/label"
import { RadioButton, RadioGroup } from "~/components/base/radio-buttons/radio-buttons"
import { FeaturedIcon } from "~/components/foundations/featured-icon/featured-icons"
import { organizationMemberCollection } from "~/db/collections"
import { Dialog, Modal, ModalOverlay } from "./modal"

interface ChangeRoleModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	user: {
		memberId: OrganizationMemberId
		id: UserId
		name: string
		role: string
	}
	currentUserRole: string
}

export function ChangeRoleModal({ isOpen, onOpenChange, user, currentUserRole }: ChangeRoleModalProps) {
	const [selectedRole, setSelectedRole] = useState(user.role)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = useCallback(async () => {
		if (selectedRole === user.role) {
			onOpenChange(false)
			return
		}

		setIsSubmitting(true)
		try {
			const tx = organizationMemberCollection.update(user.memberId, (draft) => {
				draft.role = selectedRole as "member" | "admin" | "owner"
			})

			await tx.isPersisted.promise

			toast.success("Role updated", {
				description: `${user.name}'s role has been updated to ${selectedRole}`,
			})
			onOpenChange(false)
		} catch (error) {
			toast.error("Failed to update role", {
				description: error instanceof Error ? error.message : "An error occurred",
			})
		} finally {
			setIsSubmitting(false)
		}
	}, [selectedRole, user, onOpenChange])

	const roleOptions = [
		{ value: "member", label: "Member", description: "Can view and participate in channels" },
		{ value: "admin", label: "Admin", description: "Can manage members and settings" },
		{
			value: "owner",
			label: "Owner",
			description: "Full control over the organization",
			disabled: currentUserRole !== "owner",
		},
	]

	return (
		<AriaDialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalOverlay isDismissable>
				<Modal>
					<Dialog>
						<div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-md">
							<CloseButton
								onClick={() => onOpenChange(false)}
								theme="light"
								size="lg"
								className="absolute top-3 right-3"
							/>
							<div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
								<div className="relative w-max">
									<FeaturedIcon color="gray" size="lg" theme="modern" icon={User02} />
								</div>
								<div className="z-10 flex flex-col gap-0.5">
									<AriaHeading slot="title" className="font-semibold text-md text-primary">
										Change role for {user.name}
									</AriaHeading>
									<p className="text-sm text-tertiary">
										Select a new role for this team member
									</p>
								</div>
							</div>
							<div className="flex flex-col gap-4 px-4 pb-5 sm:px-6 sm:pb-6">
								<div>
									<Label>Role</Label>
									<RadioGroup
										value={selectedRole}
										onChange={setSelectedRole}
										className="mt-2"
									>
										{roleOptions.map((option) => (
											<RadioButton
												key={option.value}
												value={option.value}
												label={option.label}
												hint={option.description}
												isDisabled={option.disabled}
											/>
										))}
									</RadioGroup>
								</div>
							</div>
							<div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-0 *:grow sm:grid sm:grid-cols-2 sm:px-6 sm:pb-6">
								<Button
									color="secondary"
									size="lg"
									onClick={() => onOpenChange(false)}
									isDisabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button
									color="primary"
									size="lg"
									onClick={handleSubmit}
									isDisabled={isSubmitting || selectedRole === user.role}
								>
									{isSubmitting ? "Updating..." : "Update role"}
								</Button>
							</div>
						</div>
					</Dialog>
				</Modal>
			</ModalOverlay>
		</AriaDialogTrigger>
	)
}
