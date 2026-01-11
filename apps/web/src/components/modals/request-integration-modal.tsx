import { useAtomSet } from "@effect-atom/atom-react"
import { type } from "arktype"
import { Exit } from "effect"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { Textarea } from "~/components/ui/textarea"
import { TextField } from "~/components/ui/text-field"
import { useAppForm } from "~/hooks/use-app-form"
import { useOrganization } from "~/hooks/use-organization"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

const requestIntegrationSchema = type({
	integrationName: "string >= 1",
	"integrationUrl?": "string.url | ''",
	description: "string | undefined",
})

type RequestIntegrationFormData = typeof requestIntegrationSchema.infer

interface RequestIntegrationModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

const createIntegrationRequestMutation = HazelRpcClient.mutation("integrationRequest.create")

export function RequestIntegrationModal({ isOpen, onOpenChange }: RequestIntegrationModalProps) {
	const { organizationId } = useOrganization()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const createRequest = useAtomSet(createIntegrationRequestMutation, {
		mode: "promiseExit",
	})

	const form = useAppForm({
		defaultValues: {
			integrationName: "",
			integrationUrl: "",
			description: "",
		} as RequestIntegrationFormData,
		validators: {
			onChange: requestIntegrationSchema,
		},
		onSubmit: async ({ value }) => {
			if (!organizationId) return

			setIsSubmitting(true)

			try {
				const exit = await createRequest({
					payload: {
						organizationId,
						integrationName: value.integrationName,
						integrationUrl: value.integrationUrl || undefined,
						description: value.description || undefined,
					},
				})

				if (Exit.isSuccess(exit)) {
					toast.success("Integration request submitted", {
						description: `We've received your request for ${value.integrationName}.`,
					})
					onOpenChange(false)
					form.reset()
				} else {
					toast.error("Failed to submit request", {
						description: "Please try again later.",
					})
				}
			} finally {
				setIsSubmitting(false)
			}
		},
	})

	const handleClose = () => {
		onOpenChange(false)
		form.reset()
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Request an Integration</ModalTitle>
					<Description>
						Let us know which tool you'd like to see integrated. We'll review your request and
						consider it for future development.
					</Description>
				</ModalHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<ModalBody className="flex flex-col gap-4">
						<form.AppField
							name="integrationName"
							children={(field) => (
								<TextField>
									<Label>Integration name *</Label>
									<Input
										placeholder="e.g., Slack, Jira, Notion"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										aria-invalid={!!field.state.meta.errors?.length}
									/>
									{field.state.meta.errors?.[0] && (
										<FieldError>{field.state.meta.errors[0].message}</FieldError>
									)}
								</TextField>
							)}
						/>

						<form.AppField
							name="integrationUrl"
							children={(field) => (
								<TextField>
									<Label>Website URL (optional)</Label>
									<Input
										type="url"
										placeholder="e.g., https://slack.com"
										value={field.state.value ?? ""}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										aria-invalid={!!field.state.meta.errors?.length}
									/>
									{field.state.meta.errors?.[0] && (
										<FieldError>Please enter a valid URL</FieldError>
									)}
								</TextField>
							)}
						/>

						<form.AppField
							name="description"
							children={(field) => (
								<TextField>
									<Label>Why do you need this integration? (optional)</Label>
									<Textarea
										placeholder="Describe how you'd use this integration..."
										value={field.state.value ?? ""}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
									/>
								</TextField>
							)}
						/>
					</ModalBody>

					<ModalFooter>
						<Button intent="outline" onPress={handleClose} type="button">
							Cancel
						</Button>
						<form.Subscribe selector={(state) => state.canSubmit}>
							{(canSubmit) => (
								<Button
									intent="primary"
									type="submit"
									isDisabled={!canSubmit || isSubmitting}
								>
									{isSubmitting ? "Submitting..." : "Submit Request"}
								</Button>
							)}
						</form.Subscribe>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	)
}
