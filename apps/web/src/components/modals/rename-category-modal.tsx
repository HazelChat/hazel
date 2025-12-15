import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelCategory } from "@hazel/db/schema"
import { type } from "arktype"
import { Button } from "~/components/ui/button"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { TextField } from "~/components/ui/text-field"
import { updateChannelCategoryAction } from "~/db/actions"
import { useAppForm } from "~/hooks/use-app-form"
import { toastExit } from "~/lib/toast-exit"

const categorySchema = type({
	name: "string > 1",
})

type CategoryFormData = typeof categorySchema.infer

interface RenameCategoryModalProps {
	category: Omit<ChannelCategory, "updatedAt"> & { updatedAt: Date | null }
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function RenameCategoryModal({ category, isOpen, onOpenChange }: RenameCategoryModalProps) {
	const updateCategory = useAtomSet(updateChannelCategoryAction, {
		mode: "promiseExit",
	})

	const form = useAppForm({
		defaultValues: {
			name: category.name,
		} as CategoryFormData,
		validators: {
			onChange: categorySchema,
		},
		onSubmit: async ({ value }) => {
			const exit = await toastExit(
				updateCategory({
					categoryId: category.id,
					name: value.name,
				}),
				{
					loading: "Renaming category...",
					success: () => {
						onOpenChange(false)
						return "Category renamed successfully"
					},
					customErrors: {
						ChannelCategoryNotFoundError: () => ({
							title: "Category not found",
							description: "This category may have been deleted.",
							isRetryable: false,
						}),
					},
				},
			)

			return exit
		},
	})

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Rename category</ModalTitle>
					<Description>Give your category a new name.</Description>
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
									{isSubmitting ? "Renaming..." : "Rename"}
								</Button>
							)}
						</form.Subscribe>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	)
}
