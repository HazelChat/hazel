import { useConvexMutation } from "@convex-dev/react-query"
import { api } from "@hazel/backend/api"
import { Mail01, Plus, Trash01, UsersPlus } from "@untitledui/icons"
import { useState } from "react"
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components"
import { toast } from "sonner"
import { Dialog, Modal, ModalOverlay } from "~/components/application/modals/modal"
import { Button } from "~/components/base/buttons/button"
import { ButtonUtility } from "~/components/base/buttons/button-utility"
import { CloseButton } from "~/components/base/buttons/close-button"
import { Input } from "~/components/base/input/input"
import { Label } from "~/components/base/input/label"
import { Select } from "~/components/base/select/select"
import { FeaturedIcon } from "~/components/foundations/featured-icon/featured-icons"
import { BackgroundPattern } from "~/components/shared-assets/background-patterns"

interface EmailInviteModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

interface InviteEntry {
	id: string
	email: string
	role: "member" | "admin"
}

export const EmailInviteModal = ({ isOpen, onOpenChange }: EmailInviteModalProps) => {
	const [invites, setInvites] = useState<InviteEntry[]>([{ id: "1", email: "", role: "member" }])
	const [isSubmitting, setIsSubmitting] = useState(false)

	const inviteMemberMutation = useConvexMutation(api.organizations.inviteMember)

	const addInviteEntry = () => {
		setInvites([
			...invites,
			{
				id: Date.now().toString(),
				email: "",
				role: "member",
			},
		])
	}

	const removeInviteEntry = (id: string) => {
		setInvites(invites.filter((invite) => invite.id !== id))
	}

	const updateInviteEntry = (id: string, field: keyof InviteEntry, value: string) => {
		setInvites(invites.map((invite) => (invite.id === id ? { ...invite, [field]: value } : invite)))
	}

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	const handleSubmit = async () => {
		// Validate all emails
		const validInvites = invites.filter((invite) => validateEmail(invite.email))

		if (validInvites.length === 0) {
			toast.error("Please enter at least one valid email address")
			return
		}

		setIsSubmitting(true)
		let successCount = 0
		let errorCount = 0

		// Send invitations
		for (const invite of validInvites) {
			try {
				await inviteMemberMutation({
					email: invite.email,
					role: invite.role,
				})
				successCount++
			} catch (error) {
				errorCount++
				console.error(`Failed to invite ${invite.email}:`, error)
			}
		}

		setIsSubmitting(false)

		// Show results
		if (successCount > 0 && errorCount === 0) {
			toast.success(`Successfully sent ${successCount} invitation${successCount > 1 ? "s" : ""}`)
			onOpenChange(false)
			// Reset form
			setInvites([{ id: "1", email: "", role: "member" }])
		} else if (successCount > 0 && errorCount > 0) {
			toast.warning(
				`Sent ${successCount} invitation${successCount > 1 ? "s" : ""}, ${errorCount} failed`,
			)
		} else {
			toast.error("Failed to send invitations")
		}
	}

	return (
		<AriaDialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalOverlay isDismissable>
				<Modal>
					<Dialog>
						<div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-130">
							<CloseButton
								onClick={() => onOpenChange(false)}
								theme="light"
								size="lg"
								className="absolute top-3 right-3"
							/>
							<div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
								<div className="relative w-max">
									<FeaturedIcon color="gray" size="lg" theme="modern" icon={UsersPlus} />
									<BackgroundPattern
										pattern="circle"
										size="sm"
										className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
									/>
								</div>
								<div className="z-10 flex flex-col gap-0.5">
									<AriaHeading slot="title" className="font-semibold text-md text-primary">
										Invite team members
									</AriaHeading>
									<p className="text-sm text-tertiary">
										Invite colleagues to join your organization. They'll receive an email
										invitation.
									</p>
								</div>
							</div>
							<div className="h-5 w-full" />
							<div className="flex flex-col items-start justify-start gap-3 px-4 sm:px-6">
								{invites.map((invite, index) => (
									<div key={invite.id} className="flex w-full items-center gap-3">
										<div className="flex flex-1 gap-3">
											<div className="flex-1">
												{index === 0 && <Label>Email address</Label>}
												<Input
													size="md"
													placeholder="colleague@company.com"
													icon={Mail01}
													value={invite.email}
													onChange={(value) =>
														updateInviteEntry(invite.id, "email", value)
													}
													isInvalid={
														invite.email !== "" && !validateEmail(invite.email)
													}
												/>
											</div>
											<div className="w-32">
												{index === 0 && <Label>Role</Label>}
												<Select
													size="md"
													selectedKey={invite.role}
													onSelectionChange={(value) =>
														updateInviteEntry(invite.id, "role", value as string)
													}
												>
													<Select.Item id="member">Member</Select.Item>
													<Select.Item id="admin">Admin</Select.Item>
												</Select>
											</div>
										</div>
										{invites.length > 1 && index > 0 && (
											<ButtonUtility
												size="sm"
												color="tertiary"
												icon={Trash01}
												onClick={() => removeInviteEntry(invite.id)}
											/>
										)}
									</div>
								))}
								<Button
									size="md"
									color="link-color"
									iconLeading={Plus}
									onClick={addInviteEntry}
									isDisabled={invites.length >= 10}
								>
									Add another
								</Button>
							</div>
							<div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-6 sm:pt-8 sm:pb-6">
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
									isDisabled={isSubmitting || invites.every((i) => !i.email)}
								>
									{isSubmitting
										? "Sending..."
										: `Send invite${invites.filter((i) => validateEmail(i.email)).length > 1 ? "s" : ""}`}
								</Button>
							</div>
						</div>
					</Dialog>
				</Modal>
			</ModalOverlay>
		</AriaDialogTrigger>
	)
}
