import { useAtomSet } from "@effect/atom-react"
import { type } from "arktype"
import { Exit } from "effect"
import { updateUserMutation } from "~/atoms/user-atoms"
import { CardDescription, CardTitle } from "~/components/ui/card"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { TextField } from "~/components/ui/text-field"
import { useAppForm } from "~/hooks/use-app-form"
import { useAuth } from "~/lib/auth"
import { exitToast } from "~/lib/toast-exit"
import { OnboardingNavigation } from "./onboarding-navigation"

const profileSchema = type({
	firstName: "string > 0",
	lastName: "string > 0",
})

type ProfileFormData = typeof profileSchema.infer

interface ProfileInfoStepProps {
	onBack: () => void
	onContinue: (data: { firstName: string; lastName: string }) => void
	defaultFirstName?: string
	defaultLastName?: string
}

export function ProfileInfoStep({
	onBack,
	onContinue,
	defaultFirstName = "",
	defaultLastName = "",
}: ProfileInfoStepProps) {
	const { user } = useAuth()
	const updateUser = useAtomSet(updateUserMutation, { mode: "promiseExit" })

	const form = useAppForm({
		defaultValues: {
			firstName: defaultFirstName,
			lastName: defaultLastName,
		} as ProfileFormData,
		validators: {
			onChange: profileSchema,
		},
		onSubmit: async ({ value }) => {
			if (!user?.id) return

			const exit = await updateUser({
				payload: {
					id: user.id,
					firstName: value.firstName.trim(),
					lastName: value.lastName.trim(),
				},
			})
			exitToast(exit)
				.onErrorTag("UserNotFoundError", () => ({
					title: "User not found",
					description: "Your account could not be found. Please try signing in again.",
					isRetryable: false,
				}))
				.run()

			if (Exit.isSuccess(exit)) {
				onContinue({
					firstName: value.firstName.trim(),
					lastName: value.lastName.trim(),
				})
			}
		},
	})

	return (
		<div data-testid="onboarding-step-profile" className="space-y-4 sm:space-y-6">
			<div className="flex flex-col space-y-1.5">
				<CardTitle>Set up your profile</CardTitle>
				<CardDescription>Tell us a bit about yourself to personalize your experience</CardDescription>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit()
				}}
			>
				<div className="space-y-4">
					<form.AppField
						name="firstName"
						children={(field) => (
							<TextField isRequired>
								<Label>First name</Label>
								<Input
									data-testid="input-first-name"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="John"
									autoFocus
									aria-invalid={!!field.state.meta.errors?.length}
								/>
								<Description>Your first name as you'd like it to appear</Description>
								{field.state.meta.errors?.[0] && (
									<FieldError>{field.state.meta.errors[0].message}</FieldError>
								)}
							</TextField>
						)}
					/>

					<form.AppField
						name="lastName"
						children={(field) => (
							<TextField isRequired>
								<Label>Last name</Label>
								<Input
									data-testid="input-last-name"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Doe"
									aria-invalid={!!field.state.meta.errors?.length}
								/>
								<Description>Your last name as you'd like it to appear</Description>
								{field.state.meta.errors?.[0] && (
									<FieldError>{field.state.meta.errors[0].message}</FieldError>
								)}
							</TextField>
						)}
					/>
				</div>

				<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
					{([canSubmit, isSubmitting]) => (
						<OnboardingNavigation
							onBack={onBack}
							onContinue={() => form.handleSubmit()}
							canContinue={canSubmit}
							isLoading={isSubmitting}
						/>
					)}
				</form.Subscribe>
			</form>
		</div>
	)
}
