import { useAtomSet } from "@effect-atom/atom-react"
import { type } from "arktype"
import { Button } from "~/components/ui/button"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { TextField } from "~/components/ui/text-field"
import { createChannelCategoryAction } from "~/db/actions"
import { useAppForm } from "~/hooks/use-app-form"
import { useOrganization } from "~/hooks/use-organization"
import { toastExit } from "~/lib/toast-exit"

const categorySchema = type({
	name: "string > 1",
})

type CategoryFormData = typeof categorySchema.infer

interface CreateCategoryModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function CreateCategoryModal({ isOpen, onOpenChange }: CreateCategoryModalProps) {
	const { organizationId } = useOrganization()

	const createCategory = useAtomSet(createChannelCategoryAction, {
		mode: "promiseExit",
	})

	const form = useAppForm({
		defaultValues: {
			name: "",
		} as CategoryFormData,
		validators: {
			onChange: categorySchema,
		},
		onSubmit: async ({ value }) => {
			if (!organizationId) return

			const exit = await toastExit(
				createCategory({
					name: value.name,
					organizationId,
				}),
				{
					loading: "Creating category...",
					success: () => {
						onOpenChange(false)
						form.reset()
						return "Category created successfully"
					},
					customErrors: {},
				},
			)

			return exit
		},
	})

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Create a new category</ModalTitle>
					<Description>Categories help organize your channels into groups.</Description>
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
									<Label>Category Name</Label>
									<Input
										placeholder="Engineering"
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
								<Button
									intent="primary"
									type="submit"
									isDisabled={!canSubmit || isSubmitting}
								>
									{isSubmitting ? "Creating..." : "Create category"}
								</Button>
							)}
						</form.Subscribe>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	)
}
