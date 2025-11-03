import { useAtomSet } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/db/schema"
import { useState } from "react"
import { toast } from "sonner"
import { createInvitationMutation } from "~/atoms/invitation-atoms"
import IconClose from "~/components/icons/icon-close"
import IconEnvelope from "~/components/icons/icon-envelope"
import IconPlus from "~/components/icons/icon-plus"
import IconUsersPlus from "~/components/icons/icon-users-plus"
import { Button } from "~/components/ui/button"
import {
	Dialog,
	DialogBody,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog"
import { Label } from "~/components/ui/field"
import { Input, InputGroup } from "~/components/ui/input"
import { Modal, ModalContent } from "~/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select"
import { useOrganization } from "~/hooks/use-organization"
import { toastExit } from "~/lib/toast-exit"

interface EmailInviteModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	organizationId?: OrganizationId
}

interface InviteEntry {
	id: string
	email: string
	role: "member" | "admin"
}

export const EmailInviteModal = ({
	isOpen,
	onOpenChange,
	organizationId: propOrgId,
}: EmailInviteModalProps) => {
	const { organizationId: hookOrgId } = useOrganization()
	const organizationId = propOrgId || hookOrgId
	const [invites, setInvites] = useState<InviteEntry[]>([{ id: "1", email: "", role: "member" }])

	const createInvitation = useAtomSet(createInvitationMutation, {
		mode: "promiseExit",
	})

	const addInviteEntry = () => {
		if (invites.length >= 10) return
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
		const validInvites = invites.filter((invite) => validateEmail(invite.email))

		if (validInvites.length === 0) {
			toast.error("Please enter at least one valid email address")
			return
		}

		let successCount = 0
		let errorCount = 0

		for (const invite of validInvites) {
			try {
				await toastExit(
					createInvitation({
						payload: {
							organizationId: organizationId!,
							email: invite.email,
							role: invite.role,
						},
					}),
					{
						loading: `Sending invitation to ${invite.email}...`,
						success: `Invitation sent to ${invite.email}`,
						error: `Failed to invite ${invite.email}`,
					},
				)
				successCount++
			} catch (error) {
				errorCount++
				console.error(`Failed to invite ${invite.email}:`, error)
			}
		}

		if (successCount > 0 && errorCount === 0) {
			toast.success(`Successfully sent ${successCount} invitation${successCount > 1 ? "s" : ""}`)
			onOpenChange(false)
			setInvites([{ id: "1", email: "", role: "member" }])
		} else if (successCount > 0 && errorCount > 0) {
			toast.warning(
				`Sent ${successCount} invitation${successCount > 1 ? "s" : ""}, ${errorCount} failed`,
			)
		} else {
			toast.error("Failed to send invitations")
		}
	}

	const validInvitesCount = invites.filter((i) => validateEmail(i.email)).length

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg">
				<Dialog>
					<DialogHeader>
						<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/50">
							<IconUsersPlus className="size-6 text-primary" />
						</div>
						<DialogTitle>Invite team members</DialogTitle>
						<DialogDescription>
							Invite colleagues to join your organization. They'll receive an email invitation.
						</DialogDescription>
					</DialogHeader>

					<DialogBody className="space-y-4">
						{invites.map((invite, index) => (
							<div key={invite.id} className="flex w-full items-end gap-2">
								<div className="flex-1 space-y-1.5">
									{index === 0 && <Label>Email address</Label>}
									<InputGroup>
										<IconEnvelope />
										<Input
											placeholder="colleague@company.com"
											value={invite.email}
											onChange={(e) =>
												updateInviteEntry(invite.id, "email", e.target.value)
											}
										/>
									</InputGroup>
								</div>
								<div className="w-28 space-y-1.5">
									{index === 0 && <Label>Role</Label>}
									<Select
										selectedKey={invite.role}
										onSelectionChange={(key) =>
											updateInviteEntry(invite.id, "role", key as string)
										}
									>
										<SelectTrigger />
										<SelectContent>
											<SelectItem id="member">Member</SelectItem>
											<SelectItem id="admin">Admin</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{invites.length > 1 && index > 0 && (
									<Button
										intent="plain"
										size="sq-md"
										onPress={() => removeInviteEntry(invite.id)}
										aria-label="Remove invite"
									>
										<IconClose data-slot="icon" />
									</Button>
								)}
							</div>
						))}
						<Button
							intent="plain"
							size="md"
							onPress={addInviteEntry}
							isDisabled={invites.length >= 10}
						>
							<IconPlus data-slot="icon" />
							Add another
						</Button>
					</DialogBody>

					<DialogFooter>
						<Button intent="secondary" onPress={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							intent="primary"
							onPress={handleSubmit}
							isDisabled={invites.every((i) => !i.email)}
						>
							Send invite{validInvitesCount > 1 ? "s" : ""}
						</Button>
					</DialogFooter>
				</Dialog>
			</ModalContent>
		</Modal>
	)
}
