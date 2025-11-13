import { useState } from "react"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input, InputGroup } from "~/components/ui/input"
import { TextField } from "~/components/ui/text-field"
import { OnboardingNavigation } from "./onboarding-navigation"

interface OrgSetupStepProps {
	onBack: () => void
	onContinue: (data: { name: string; slug: string }) => Promise<void>
	defaultName?: string
	defaultSlug?: string
}

export function OrgSetupStep({ onBack, onContinue, defaultName = "", defaultSlug = "" }: OrgSetupStepProps) {
	const [name, setName] = useState(defaultName)
	const [slug, setSlug] = useState(defaultSlug)
	const [slugError, setSlugError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const handleSlugChange = (value: string) => {
		// Convert to URL-safe slug: lowercase, remove special chars, replace spaces with hyphens
		const sanitized = value
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.slice(0, 50)

		setSlug(sanitized)
		setSlugError(null)
	}

	const handleContinue = async () => {
		// Validate slug
		if (slug.length < 3) {
			setSlugError("Slug must be at least 3 characters long")
			return
		}

		if (slug.startsWith("-") || slug.endsWith("-")) {
			setSlugError("Slug cannot start or end with a hyphen")
			return
		}

		setIsLoading(true)
		try {
			await onContinue({ name, slug })
		} catch (error) {
			console.error("Failed to set up organization:", error)
			setSlugError("Failed to set up organization. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	const canContinue = name.trim().length > 0 && slug.length >= 3 && !slugError

	return (
		<div className="space-y-6">
			<CardHeader>
				<CardTitle>Set up your workspace</CardTitle>
				<CardDescription>
					Choose a name and URL for your organization. You can change these later.
				</CardDescription>
			</CardHeader>

			<div className="space-y-4">
				<TextField isRequired>
					<Label>Organization name</Label>
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Acme Inc."
						autoFocus
					/>
					<Description>The display name for your organization</Description>
				</TextField>

				<TextField isRequired isInvalid={!!slugError}>
					<Label>Workspace URL</Label>
					<div className="relative">
						<div className="flex items-center gap-2">
							<span className="text-muted-fg text-sm">hazel.app/</span>

							<Input
								value={slug}
								onChange={(e) => handleSlugChange(e.target.value)}
								placeholder="acme"
							/>
						</div>
					</div>
					{slugError ? (
						<FieldError>{slugError}</FieldError>
					) : (
						<Description>
							Your unique workspace URL (lowercase letters, numbers, and hyphens)
						</Description>
					)}
				</TextField>

				{slug && slug.length >= 3 && !slugError && (
					<div className="rounded-lg border border-border bg-muted/30 p-4">
						<p className="text-muted-fg text-sm">
							Your workspace will be accessible at:{" "}
							<span className="font-medium text-fg">hazel.app/{slug}</span>
						</p>
					</div>
				)}
			</div>

			<OnboardingNavigation
				onBack={onBack}
				onContinue={handleContinue}
				canContinue={canContinue}
				isLoading={isLoading}
			/>
		</div>
	)
}
