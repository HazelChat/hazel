import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelCategoryId } from "@hazel/schema"
import { useNavigate } from "@tanstack/react-router"
import { type } from "arktype"
import { useState } from "react"
import { ChannelIcon } from "~/components/channel-icon"
import { EmojiPickerDialog } from "~/components/emoji-picker/emoji-picker-dialog"
import { Button } from "~/components/ui/button"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input, InputGroup } from "~/components/ui/input"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "~/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select"
import { TextField } from "~/components/ui/text-field"
import { createChannelAction } from "~/db/actions"
import { useAppForm } from "~/hooks/use-app-form"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import { toastExit } from "~/lib/toast-exit"

const channelSchema = type({
	name: "string > 2",
	type: "'public'|'private'",
})

type ChannelFormData = typeof channelSchema.infer

interface CreateChannelModalProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	categoryId?: ChannelCategoryId | null
}

export function CreateChannelModal({ isOpen, onOpenChange, categoryId }: CreateChannelModalProps) {
	const { user } = useAuth()
	const { organizationId, slug } = useOrganization()
	const navigate = useNavigate()
	const [icon, setIcon] = useState<string | null>(null)

	const createChannel = useAtomSet(createChannelAction, {
		mode: "promiseExit",
	})

	const form = useAppForm({
		defaultValues: {
			name: "",
			type: "public" as "public" | "private",
		} as ChannelFormData,
		validators: {
			onChange: channelSchema,
		},
		onSubmit: async ({ value }) => {
			if (!user?.id || !organizationId || !slug) return

			const exit = await toastExit(
				createChannel({
					name: value.name,
					icon,
					type: value.type,
					organizationId,
					parentChannelId: null,
					categoryId: categoryId ?? null,
					currentUserId: user.id,
				}),
				{
					loading: "Creating channel...",
					success: (result) => {
						// Navigate to the new channel
						navigate({
							to: "/$orgSlug/chat/$id",
							params: {
								orgSlug: slug,
								id: result.mutateResult.channelId,
							},
						})

						// Close modal and reset form
						onOpenChange(false)
						form.reset()
						setIcon(null)

						return "Channel created successfully"
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
					<ModalTitle>Create a new Channel</ModalTitle>
					<Description>Give your channel a name and type to create a new channel.</Description>
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
									<Label>Channel Name</Label>
									<InputGroup>
										<EmojiPickerDialog onEmojiSelect={(emoji) => setIcon(emoji.emoji)}>
											<Button
												intent="plain"
												size="sq-sm"
												data-slot="icon"
												className="text-muted-fg hover:text-fg"
												type="button"
											>
												<ChannelIcon icon={icon} />
											</Button>
										</EmojiPickerDialog>
										<Input
											placeholder="general"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											aria-invalid={!!field.state.meta.errors?.length}
										/>
									</InputGroup>
									{field.state.meta.errors?.[0] && (
										<FieldError>{field.state.meta.errors[0].message}</FieldError>
									)}
								</TextField>
							)}
						/>

						<form.AppField
							name="type"
							children={(field) => (
								<>
									<Label>Channel Type</Label>
									<Select
										defaultSelectedKey={field.state.value}
										onSelectionChange={(key) =>
											field.handleChange(key as "public" | "private")
										}
									>
										<SelectTrigger />
										<SelectContent>
											<SelectItem id="public" textValue="Public">
												Public
											</SelectItem>
											<SelectItem id="private" textValue="Private">
												Private
											</SelectItem>
										</SelectContent>
									</Select>
									{field.state.meta.errors?.[0] && (
										<FieldError>{field.state.meta.errors[0].message}</FieldError>
									)}
								</>
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
									{isSubmitting ? "Creating..." : "Create channel"}
								</Button>
							)}
						</form.Subscribe>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	)
}
