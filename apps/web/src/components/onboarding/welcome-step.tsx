import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { OnboardingNavigation } from "./onboarding-navigation"

interface WelcomeStepProps {
	onContinue: () => void
	isCreatingOrg: boolean
	organizationName?: string
}

export function WelcomeStep({ onContinue, isCreatingOrg, organizationName }: WelcomeStepProps) {
	return (
		<div className="space-y-6">
			<CardHeader className="text-center">
				<CardTitle className="text-3xl">
					{isCreatingOrg ? "Welcome to Hazel!" : `Welcome to ${organizationName}!`}
				</CardTitle>
				<CardDescription className="text-base">
					{isCreatingOrg
						? "Let's set up your workspace in just a few quick steps. This will only take a minute."
						: "Let's get you set up with your workspace. We just need a few details to personalize your experience."}
				</CardDescription>
			</CardHeader>

			<div className="space-y-4 rounded-lg border border-border bg-muted/30 p-6">
				<h3 className="font-medium text-fg">What's next:</h3>
				<ul className="space-y-3 text-muted-fg text-sm">
					{isCreatingOrg ? (
						<>
							<li className="flex items-start gap-2">
								<span className="text-primary">✓</span>
								<span>Set up your organization workspace</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">✓</span>
								<span>Tell us about your use case</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">✓</span>
								<span>Share your role</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">✓</span>
								<span>Invite your team (optional)</span>
							</li>
						</>
					) : (
						<>
							<li className="flex items-start gap-2">
								<span className="text-primary">✓</span>
								<span>Tell us about your use case</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">✓</span>
								<span>Share your role</span>
							</li>
						</>
					)}
				</ul>
			</div>

			<OnboardingNavigation onContinue={onContinue} showBack={false} continueLabel="Get Started" />
		</div>
	)
}
