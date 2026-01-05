import { useAtomSet } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import IconClose from "~/components/icons/icon-close"
import IconPlus from "~/components/icons/icon-plus"
import { Exit } from "effect"
import { useState } from "react"
import { createInvitationMutation } from "~/atoms/invitation-atoms"
import { Button } from "~/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { TextField } from "~/components/ui/text-field"
import { toastExit } from "~/lib/toast-exit"
import { OnboardingNavigation } from "./onboarding-navigation"

interface InviteTeamStepProps {
	onBack: () => void
	onContinue: (emails: string[]) => void
	onSkip: () => void
	organizationId: OrganizationId | undefined
}

export function InviteTeamStep({ onBack, onContinue, onSkip, organizationId }: InviteTeamStepProps) {
	const createInvitation = useAtomSet(createInvitationMutation, { mode: "promiseExit" })
	const [emails, setEmails] = useState<string[]>([""])
	const [errors, setErrors] = useState<Record<number, string>>({})
	const [isLoading, setIsLoading] = useState(false)

	const addEmailField = () => {
		setEmails([...emails, ""])
	}

	const removeEmailField = (index: number) => {
		const newEmails = emails.filter((_, i) => i !== index)
		setEmails(newEmails.length > 0 ? newEmails : [""])
		const newErrors = { ...errors }
		delete newErrors[index]
		setErrors(newErrors)
	}

	const updateEmail = (index: number, value: string) => {
		const newEmails = [...emails]
		newEmails[index] = value
		setEmails(newEmails)

		// Clear error for this field
		if (errors[index]) {
			const newErrors = { ...errors }
			delete newErrors[index]
			setErrors(newErrors)
		}
	}

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	const handleContinue = async () => {
		// Filter out empty emails
		const filledEmails = emails.filter((email) => email.trim().length > 0)

		if (filledEmails.length === 0) {
			onSkip()
			return
		}

		// Validate all emails
		const newErrors: Record<number, string> = {}
		filledEmails.forEach((email, index) => {
			if (!validateEmail(email)) {
				newErrors[index] = "Please enter a valid email address"
			}
		})

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		if (!organizationId) {
			console.error("No organization ID available")
			return
		}

		setIsLoading(true)
		try {
			const exit = await toastExit(
				createInvitation({
					payload: {
						organizationId: organizationId,
						invites: filledEmails.map((email) => ({
							email,
							role: "member",
						})),
					},
				}),
				{
					loading: `Sending ${filledEmails.length} invitation${filledEmails.length > 1 ? "s" : ""}...`,
					success: (result) => {
						const { successCount, errorCount } = result
						if (errorCount > 0) {
							return `Sent ${successCount} invitation${successCount !== 1 ? "s" : ""}, ${errorCount} failed`
						}
						return `Sent ${successCount} invitation${successCount !== 1 ? "s" : ""} successfully`
					},
				},
			)

			if (Exit.isSuccess(exit)) {
				onContinue(filledEmails)
			}
		} finally {
			setIsLoading(false)
		}
	}

	const hasValidEmails = emails.some((email) => email.trim().length > 0 && validateEmail(email))

	return (
		<div className="space-y-6">
			<CardHeader>
				<CardTitle>Invite your team</CardTitle>
				<CardDescription>
					Collaboration is better together. Invite teammates to join your workspace (you can also do
					this later).
				</CardDescription>
			</CardHeader>

			<div className="space-y-3">
				{emails.map((email, index) => (
					<TextField key={index} isInvalid={!!errors[index]}>
						<Label className="sr-only">Email {index + 1}</Label>
						<div className="flex items-center gap-2">
							<Input
								type="email"
								value={email}
								onChange={(e) => updateEmail(index, e.target.value)}
								placeholder="colleague@example.com"
								autoFocus={index === 0}
							/>
							{emails.length > 1 && (
								<Button
									intent="secondary"
									size="sq-sm"
									onPress={() => removeEmailField(index)}
									aria-label="Remove email"
								>
									<IconClose className="size-4" />
								</Button>
							)}
						</div>
						{errors[index] && <FieldError>{errors[index]}</FieldError>}
					</TextField>
				))}

				<Button
					intent="secondary"
					onPress={addEmailField}
					className="w-full"
					isDisabled={emails.length >= 10}
				>
					<IconPlus className="size-4" />
					Add another email
				</Button>

				{emails.length >= 10 && (
					<Description>Maximum of 10 invites at a time. You can invite more later.</Description>
				)}
			</div>

			<OnboardingNavigation
				onBack={onBack}
				onContinue={handleContinue}
				canContinue={true}
				isLoading={isLoading}
				continueLabel={hasValidEmails ? "Send invites" : "Skip for now"}
			/>
		</div>
	)
}
