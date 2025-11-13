import {
	ChartBarIcon,
	CommandLineIcon,
	CubeIcon,
	LightBulbIcon,
	PaintBrushIcon,
	PresentationChartLineIcon,
	RocketLaunchIcon,
	UserIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import {
	ChoiceBox,
	ChoiceBoxDescription,
	ChoiceBoxItem,
	ChoiceBoxLabel,
} from "~/components/ui/choice-box"
import { OnboardingNavigation } from "./onboarding-navigation"

const roles = [
	{
		id: "developer",
		label: "Developer / Engineer",
		description: "Write code and build features",
		icon: CommandLineIcon,
	},
	{
		id: "designer",
		label: "Designer",
		description: "Create interfaces and experiences",
		icon: PaintBrushIcon,
	},
	{
		id: "pm",
		label: "Product Manager",
		description: "Define roadmap and requirements",
		icon: CubeIcon,
	},
	{
		id: "marketing",
		label: "Marketing",
		description: "Growth, campaigns, and content",
		icon: MegaphoneIcon,
	},
	{
		id: "sales",
		label: "Sales / Business Development",
		description: "Revenue and customer relationships",
		icon: PresentationChartLineIcon,
	},
	{
		id: "data",
		label: "Data / Analytics",
		description: "Insights, metrics, and analysis",
		icon: ChartBarIcon,
	},
	{
		id: "leadership",
		label: "Leadership / Executive",
		description: "Strategy and decision making",
		icon: RocketLaunchIcon,
	},
	{
		id: "founder",
		label: "Founder / Entrepreneur",
		description: "Building and growing a business",
		icon: LightBulbIcon,
	},
	{
		id: "other",
		label: "Other",
		description: "A different role or multiple roles",
		icon: UserIcon,
	},
]

// Import missing icon
import { MegaphoneIcon } from "@heroicons/react/24/outline"

interface RoleStepProps {
	onBack: () => void
	onContinue: (role: string) => void | Promise<void>
	defaultSelection?: string
}

export function RoleStep({ onBack, onContinue, defaultSelection }: RoleStepProps) {
	const [selected, setSelected] = useState<string | undefined>(defaultSelection)

	const handleContinue = async () => {
		if (selected) {
			await onContinue(selected)
		}
	}

	return (
		<div className="space-y-6">
			<CardHeader>
				<CardTitle>What's your role?</CardTitle>
				<CardDescription>
					Help us tailor Hazel to your needs by selecting your primary role.
				</CardDescription>
			</CardHeader>

			<div>
				<ChoiceBox
					gap={4}
					columns={2}
					selectionMode="single"
					layout="grid"
					aria-label="Role"
					selectedKeys={selected ? [selected] : []}
					onSelectionChange={(keys) => {
						const values = Array.from(keys)
						setSelected(values[0] as string)
					}}
					items={roles}
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

			<OnboardingNavigation
				onBack={onBack}
				onContinue={handleContinue}
				canContinue={!!selected}
			/>
		</div>
	)
}
