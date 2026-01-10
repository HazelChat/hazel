import { Button } from "~/components/ui/button"

interface OnboardingNavigationProps {
	onBack?: () => void
	onContinue?: () => void
	canContinue?: boolean
	isLoading?: boolean
	continueLabel?: string
	showBack?: boolean
}

export function OnboardingNavigation({
	onBack,
	onContinue,
	canContinue = true,
	isLoading = false,
	continueLabel = "Continue",
	showBack = true,
}: OnboardingNavigationProps) {
	return (
		<div className="sticky bottom-0 flex flex-wrap justify-between gap-2 pt-4 pb-2 bg-bg sm:static sm:pb-0">
			{showBack ? (
				<Button
					data-testid="onboarding-back-btn"
					intent="secondary"
					onPress={onBack}
					isDisabled={isLoading}
				>
					&larr; Back
				</Button>
			) : (
				<div />
			)}
			<Button
				data-testid="onboarding-continue-btn"
				onPress={onContinue}
				isDisabled={!canContinue || isLoading}
				isPending={isLoading}
				className="group"
			>
				{continueLabel} <span className="duration-300 group-hover:translate-x-1">&rarr;</span>
			</Button>
		</div>
	)
}
