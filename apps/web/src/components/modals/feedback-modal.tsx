import { type } from "arktype"
import { usePostHog } from "posthog-js/react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select"
import { TextField } from "~/components/ui/text-field"
import { Textarea } from "~/components/ui/textarea"
import { useAppForm } from "~/hooks/use-app-form"
import { useOrganization } from "~/hooks/use-organization"

const feedbackSchema = type({
	category: "'bug'|'feature_request'|'question'",
	message: "string >= 6",
})

type FeedbackFormData = typeof feedbackSchema.infer

const CATEGORY_OPTIONS = [
	{ id: "bug", label: "Bug" },
	{ id: "feature_request", label: "Feature Request" },
	{ id: "question", label: "Question" },
] as const

interface FeedbackModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function FeedbackModal({ isOpen, onOpenChange }: FeedbackModalProps) {
	const { organizationId } = useOrganization()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const posthog = usePostHog()

	const form = useAppForm({
		defaultValues: {
			category: "bug" as "bug" | "feature_request" | "question",
			message: "",
		} as FeedbackFormData,
		validators: {
			onChange: feedbackSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true)

			try {
				posthog?.capture("feedback_submitted", {
					category: value.category,
					message: value.message,
					organizationId: organizationId ?? undefined,
				})

				toast.success("Thank you for your feedback!")
				onOpenChange(false)
				form.reset()
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
					<ModalTitle>Send Feedback</ModalTitle>
					<Description>
						Help us improve by sharing your thoughts, reporting bugs, or requesting features.
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
							name="category"
							children={(field) => (
								<TextField>
									<Label>Category</Label>
									<Select
										selectedKey={field.state.value}
										onSelectionChange={(key) =>
											field.handleChange(key as "bug" | "feature_request" | "question")
										}
									>
										<SelectTrigger />
										<SelectContent>
											{CATEGORY_OPTIONS.map((option) => (
												<SelectItem
													key={option.id}
													id={option.id}
													textValue={option.label}
												>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{field.state.meta.errors?.[0] && (
										<FieldError>{field.state.meta.errors[0].message}</FieldError>
									)}
								</TextField>
							)}
						/>

						<form.AppField
							name="message"
							children={(field) => (
								<TextField>
									<Label>Message</Label>
									<Textarea
										placeholder="Describe your feedback in detail..."
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
									{isSubmitting ? "Submitting..." : "Submit Feedback"}
								</Button>
							)}
						</form.Subscribe>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	)
}
