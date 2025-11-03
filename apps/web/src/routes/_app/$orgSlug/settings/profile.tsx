import { createFileRoute } from "@tanstack/react-router"
import { type } from "arktype"
import { useEffect } from "react"
import { toast } from "sonner"
import IconEnvelope from "~/components/icons/icon-envelope"
import { Button } from "~/components/ui/button"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input, InputGroup } from "~/components/ui/input"
import { SectionHeader } from "~/components/ui/section-header"
import { SectionLabel } from "~/components/ui/section-label"
import { TextField } from "~/components/ui/text-field"
import { userCollection } from "~/db/collections"
import { useAppForm } from "~/hooks/use-app-form"
import { useAuth } from "~/lib/auth"

export const Route = createFileRoute("/_app/$orgSlug/settings/profile")({
	component: ProfileSettings,
})

const profileSchema = type({
	firstName: "string > 0",
	lastName: "string > 0",
})

type ProfileFormData = typeof profileSchema.infer

function ProfileSettings() {
	const { user } = useAuth()

	const form = useAppForm({
		defaultValues: {
			firstName: "",
			lastName: "",
		} as ProfileFormData,
		validators: {
			onChange: profileSchema,
		},
		onSubmit: async ({ value }) => {
			if (!user) return
			try {
				const tx = userCollection.update(user.id, (draft) => {
					draft.firstName = value.firstName
					draft.lastName = value.lastName
				})
				await tx.isPersisted.promise
				toast.success("Profile updated successfully")
			} catch (error) {
				console.error("Error updating profile:", error)
				toast.error("Failed to update profile")
			}
		},
	})

	useEffect(() => {
		if (user) {
			form.setFieldValue("firstName", user.firstName || "")
			form.setFieldValue("lastName", user.lastName || "")
		}
	}, [user, form])

	return (
		<form
			className="flex flex-col gap-6 px-4 lg:px-8"
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit()
			}}
		>
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
						<SectionHeader.Heading>Profile</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Manage your profile information and preferences.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<div className="max-w-xl space-y-6">
				<div className="space-y-2">
					<SectionLabel.Root isRequired size="sm" title="Name" className="max-lg:hidden" />

					<div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-4">
						<form.AppField
							name="firstName"
							children={(field) => (
								<field.TextField
									isRequired
									name="firstName"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									onBlur={field.handleBlur}
									isInvalid={!!field.state.meta.errors?.length}
								>
									<Label className="lg:hidden">First name</Label>
									<Input />
									{field.state.meta.errors?.length > 0 && (
										<FieldError>
											{field.state.meta.errors[0]?.message || "First name is required"}
										</FieldError>
									)}
								</field.TextField>
							)}
						/>
						<form.AppField
							name="lastName"
							children={(field) => (
								<field.TextField
									isRequired
									name="lastName"
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									onBlur={field.handleBlur}
									isInvalid={!!field.state.meta.errors?.length}
								>
									<Label className="lg:hidden">Last name</Label>
									<Input />
									{field.state.meta.errors?.length > 0 && (
										<FieldError>
											{field.state.meta.errors[0]?.message || "Last name is required"}
										</FieldError>
									)}
								</field.TextField>
							)}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<SectionLabel.Root size="sm" title="Email address" className="max-lg:hidden" />

					<TextField isDisabled>
						<Label className="lg:hidden">Email address</Label>
						<InputGroup>
							<IconEnvelope data-slot="icon" />
							<Input type="email" value={user?.email} />
						</InputGroup>
					</TextField>
				</div>

				<div className="flex justify-end">
					<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
						{([canSubmit, isSubmitting]) => (
							<Button type="submit" intent="primary" isDisabled={!canSubmit || isSubmitting}>
								{isSubmitting ? "Saving..." : "Save"}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</div>
		</form>
	)
}
