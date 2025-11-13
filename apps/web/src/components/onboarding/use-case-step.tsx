import { BuildingOfficeIcon, UserIcon, UserGroupIcon, UsersIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
	ChoiceBox,
	ChoiceBoxDescription,
	ChoiceBoxItem,
	ChoiceBoxLabel,
} from "~/components/ui/choice-box"
import { OnboardingNavigation } from "./onboarding-navigation"

const teamSizes = [
	{
		id: "solo",
		label: "Just me",
		description: "Solo user or personal workspace",
		icon: UserIcon,
	},
	{
		id: "small",
		label: "2-10 people",
		description: "Small team or startup",
		icon: UsersIcon,
	},
	{
		id: "medium",
		label: "11-50 people",
		description: "Growing team",
		icon: UserGroupIcon,
	},
	{
		id: "large",
		label: "51-200 people",
		description: "Medium-sized company",
		icon: BuildingOfficeIcon,
	},
	{
		id: "xlarge",
		label: "201-1000 people",
		description: "Large organization",
		icon: BuildingOfficeIcon,
	},
	{
		id: "enterprise",
		label: "1000+ people",
		description: "Enterprise",
		icon: BuildingOfficeIcon,
	},
]

interface UseCaseStepProps {
	onBack: () => void
	onContinue: (useCases: string[]) => void
	defaultSelection?: string[]
}

export function UseCaseStep({ onBack, onContinue, defaultSelection = [] }: UseCaseStepProps) {
	const [selected, setSelected] = useState<string | undefined>(defaultSelection[0])

	const handleContinue = () => {
		if (selected) {
			onContinue([selected])
		}
	}

	return (
		<div className="space-y-6">
			<CardHeader>
				<CardTitle>How big is your team?</CardTitle>
				<CardDescription>This helps us optimize Hazel for your team size.</CardDescription>
			</CardHeader>

			<div>
				<ChoiceBox
					gap={4}
					columns={2}
					selectionMode="single"
					layout="grid"
					aria-label="Team size"
					selectedKeys={selected ? [selected] : []}
					onSelectionChange={(keys) => {
						const values = Array.from(keys)
						setSelected(values[0] as string)
					}}
					items={teamSizes}
				>
					{(item) => {
						const Icon = item.icon
						return (
							<ChoiceBoxItem key={item.id} id={item.id} textValue={item.label}>
								<Icon />
								<ChoiceBoxLabel>{item.label}</ChoiceBoxLabel>
								<ChoiceBoxDescription>{item.description}</ChoiceBoxDescription>
							</ChoiceBoxItem>
						)
					}}
				</ChoiceBox>
			</div>

			<OnboardingNavigation onBack={onBack} onContinue={handleContinue} canContinue={!!selected} />
		</div>
	)
}
