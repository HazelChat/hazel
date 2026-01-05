import { IconChartBar } from "~/components/icons/icon-chart-bar"
import { IconCode } from "~/components/icons/icon-code"
import { IconCube } from "~/components/icons/icon-cube"
import { IconLightbulb } from "~/components/icons/icon-lightbulb"
import { IconMegaphone } from "~/components/icons/icon-megaphone"
import { IconPaintbrush } from "~/components/icons/icon-paintbrush"
import { IconPresentationChart } from "~/components/icons/icon-presentation-chart"
import { IconRocket } from "~/components/icons/icon-rocket"
import { IconUser } from "~/components/icons/icon-user"
import { useState } from "react"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { ChoiceBox, ChoiceBoxDescription, ChoiceBoxItem, ChoiceBoxLabel } from "~/components/ui/choice-box"
import { OnboardingNavigation } from "./onboarding-navigation"

const roles = [
	{
		id: "developer",
		label: "Developer / Engineer",
		description: "Write code and build features",
		icon: IconCode,
	},
	{
		id: "designer",
		label: "Designer",
		description: "Create interfaces and experiences",
		icon: IconPaintbrush,
	},
	{
		id: "pm",
		label: "Product Manager",
		description: "Define roadmap and requirements",
		icon: IconCube,
	},
	{
		id: "marketing",
		label: "Marketing",
		description: "Growth, campaigns, and content",
		icon: IconMegaphone,
	},
	{
		id: "sales",
		label: "Sales / Business Development",
		description: "Revenue and customer relationships",
		icon: IconPresentationChart,
	},
	{
		id: "data",
		label: "Data / Analytics",
		description: "Insights, metrics, and analysis",
		icon: IconChartBar,
	},
	{
		id: "leadership",
		label: "Leadership / Executive",
		description: "Strategy and decision making",
		icon: IconRocket,
	},
	{
		id: "founder",
		label: "Founder / Entrepreneur",
		description: "Building and growing a business",
		icon: IconLightbulb,
	},
	{
		id: "other",
		label: "Other",
		description: "A different role or multiple roles",
		icon: IconUser,
	},
]

interface RoleStepProps {
	onBack: () => void
	onContinue: (role: string) => void | Promise<void>
	defaultSelection?: string
}

export function RoleStep({ onBack, onContinue, defaultSelection }: RoleStepProps) {
	const [selected, setSelected] = useState<string | undefined>(defaultSelection)

	const handleContinue = () => {
		if (selected) {
			onContinue(selected)
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

			<OnboardingNavigation onBack={onBack} onContinue={handleContinue} canContinue={!!selected} />
		</div>
	)
}
