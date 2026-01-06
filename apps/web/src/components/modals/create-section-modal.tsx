import { useAtomSet } from "@effect-atom/atom-react"
import { type } from "arktype"
import { Button } from "~/components/ui/button"
import { FieldError, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { TextField } from "~/components/ui/text-field"
import { createChannelSectionAction } from "~/db/actions"
import { useAppForm } from "~/hooks/use-app-form"
import { useOrganization } from "~/hooks/use-organization"
import { toastExit } from "~/lib/toast-exit"

const sectionSchema = type({
	name: "string > 1",
})

type SectionFormData = typeof sectionSchema.infer

interface CreateSectionModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateSectionModal({ isOpen, onOpenChange }: CreateSectionModalProps) {
	const { organizationId } = useOrganization()

	const createSection = useAtomSet(createChannelSectionAction, {
		mode: "promiseExit",
	})

	const form = useAppForm({
		defaultValues: {
			name: "",
		} as SectionFormData,
		validators: {
			onChange: sectionSchema,
		},
		onSubmit: async ({ value }) => {
			if (!organizationId) return

			const exit = await toastExit(
				createSection({
					name: value.name,
					organizationId,
				}),
				{
					loading: "Creating section...",
					success: () => {
						// Close modal and reset form
						onOpenChange(false)
						form.reset()

						return "Section created successfully"
					},
					customErrors: {},
				},
			)

			return exit
		},
	})

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="md">
				<ModalHeader>
					<ModalTitle>Create a new Section</ModalTitle>
				</ModalHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<ModalBody className="flex flex-col gap-4">
						<form.AppField
							name="name"
							children={(field) => (
								<TextField>
									<Label>Section Name</Label>
									<Input
										placeholder="Design"
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
						<Button intent="outline" onPress={() => onOpenChange(false)} type="button">
							Cancel
						</Button>
						<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
							{([canSubmit, isSubmitting]) => (
								<Button intent="primary" type="submit" isDisabled={!canSubmit || isSubmitting}>
									{isSubmitting ? "Creating..." : "Create section"}
								</Button>
							)}
						</form.Subscribe>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	)
}
