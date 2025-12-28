import { useAtomSet } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { createInvitationMutation } from "~/atoms/invitation-atoms"
import IconClose from "~/components/icons/icon-close"
import IconEnvelope from "~/components/icons/icon-envelope"
import IconPlus from "~/components/icons/icon-plus"
import IconUsersPlus from "~/components/icons/icon-users-plus"
import { Button } from "~/components/ui/button"
import { Description, Label } from "~/components/ui/field"
import { Input, InputGroup } from "~/components/ui/input"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select"
import { useAppForm } from "~/hooks/use-app-form"
import { useOrganization } from "~/hooks/use-organization"
import { toastExit } from "~/lib/toast-exit"

interface InviteFormData {
	invites: {
		email: string
		role: "member" | "admin"
	}[]
}

interface EmailInviteModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	organizationId?: OrganizationId
}

export const EmailInviteModal = ({
	isOpen,
	onOpenChange,
	organizationId: propOrgId,
}: EmailInviteModalProps) => {
	const { organizationId: hookOrgId } = useOrganization()
	const organizationId = propOrgId || hookOrgId

	const createInvitation = useAtomSet(createInvitationMutation, {
		mode: "promiseExit",
	})

	const form = useAppForm({
		defaultValues: {
			invites: [{ email: "", role: "member" as const }],
		} as InviteFormData,
		onSubmit: async ({ value }) => {
			if (!organizationId) return

			// Filter out empty emails
			const validInvites = value.invites.filter((invite) => invite.email.trim() !== "")

			if (validInvites.length === 0) return

			const exit = await toastExit(
				createInvitation({
					payload: {
						organizationId,
						invites: validInvites,
					},
				}),
				{
					loading: "Sending invitations...",
					success: (result) => {
						const { successCount, errorCount } = result

						// Close modal and reset form
						onOpenChange(false)
						form.reset()

						if (successCount > 0 && errorCount === 0) {
							return `Successfully sent ${successCount} invitation${successCount > 1 ? "s" : ""}`
						}
						if (successCount > 0 && errorCount > 0) {
							return `Sent ${successCount} invitation${successCount > 1 ? "s" : ""}, ${errorCount} failed`
						}
						return "Failed to send invitations"
					},
					error: "Failed to send invitations",
				},
			)

			return exit
		},
	})

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg">
				<ModalHeader>
					<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/50">
						<IconUsersPlus className="size-6 text-primary" />
					</div>
					<ModalTitle>Invite team members</ModalTitle>
					<Description>
						Invite colleagues to join your organization. They'll receive an email invitation.
					</Description>
				</ModalHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<ModalBody className="flex flex-col gap-4">
						<form.Field name="invites" mode="array">
							{(field) => (
								<>
									{field.state.value.map((_, index) => (
										<div key={index} className="flex w-full items-end gap-2">
											<div className="flex-1 space-y-1.5">
												{index === 0 && <Label>Email address</Label>}
												<form.Field name={`invites[${index}].email`}>
													{(emailField) => (
														<InputGroup>
															<IconEnvelope />
															<Input
																placeholder="colleague@company.com"
																value={emailField.state.value}
																onChange={(e) =>
																	emailField.handleChange(e.target.value)
																}
																onBlur={emailField.handleBlur}
															/>
														</InputGroup>
													)}
												</form.Field>
											</div>
											<div className="w-28 space-y-1.5">
												{index === 0 && <Label>Role</Label>}
												<form.Field name={`invites[${index}].role`}>
													{(roleField) => (
														<Select
															defaultSelectedKey={roleField.state.value}
															onSelectionChange={(key) =>
																roleField.handleChange(
																	key as "member" | "admin",
																)
															}
														>
															<SelectTrigger />
															<SelectContent>
																<SelectItem id="member">Member</SelectItem>
																<SelectItem id="admin">Admin</SelectItem>
															</SelectContent>
														</Select>
													)}
												</form.Field>
											</div>
											{field.state.value.length > 1 && index > 0 && (
												<Button
													intent="plain"
													size="sq-md"
													onPress={() => field.removeValue(index)}
													aria-label="Remove invite"
													type="button"
												>
													<IconClose data-slot="icon" />
												</Button>
											)}
										</div>
									))}
									<Button
										intent="plain"
										size="md"
										onPress={() => field.pushValue({ email: "", role: "member" })}
										isDisabled={field.state.value.length >= 10}
										type="button"
									>
										<IconPlus data-slot="icon" />
										Add another
									</Button>
								</>
							)}
						</form.Field>
					</ModalBody>

					<ModalFooter>
						<Button intent="outline" onPress={() => onOpenChange(false)} type="button">
							Cancel
						</Button>
						<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
							{([canSubmit, isSubmitting]) => {
								const validInvitesCount = form.state.values.invites.filter(
									(i) => i.email.trim() !== "",
								).length

								return (
									<Button
										intent="primary"
										type="submit"
										isDisabled={!canSubmit || isSubmitting}
									>
										{isSubmitting
											? "Sending..."
											: `Send invite${validInvitesCount > 1 ? "s" : ""}`}
									</Button>
								)
							}}
						</form.Subscribe>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	)
}
