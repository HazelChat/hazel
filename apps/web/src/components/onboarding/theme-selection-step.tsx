import { useState } from "react"
import type { Color } from "react-aria-components"
import { ColorSwatch, parseColor, Radio, RadioGroup } from "react-aria-components"
import { Dark, Light, System } from "~/components/modals/appearances"
import { type Theme, useTheme } from "~/components/theme-provider"
import { CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/utils"
import { OnboardingNavigation } from "./onboarding-navigation"

interface ThemeSelectionStepProps {
	onBack: () => void
	onContinue: (data: { theme: "dark" | "light" | "system"; brandColor: string }) => void
	defaultTheme?: "dark" | "light" | "system"
	defaultBrandColor?: string
}

export function ThemeSelectionStep({
	onBack,
	onContinue,
	defaultTheme,
	defaultBrandColor,
}: ThemeSelectionStepProps) {
	const { theme, setTheme, brandColor, setBrandColor } = useTheme()
	const [selectedTheme, setSelectedTheme] = useState<Theme>(defaultTheme || theme)
	const [selectedBrandColor, setSelectedBrandColor] = useState(defaultBrandColor || brandColor)

	const colorSwatches = [
		{ hex: "#535862", name: "gray" },
		{ hex: "#099250", name: "green" },
		{ hex: "#1570EF", name: "blue" },
		{ hex: "#444CE7", name: "indigo" },
		{ hex: "#6938EF", name: "purple" },
		{ hex: "#BA24D5", name: "fuchsia" },
		{ hex: "#DD2590", name: "pink" },
		{ hex: "#E04F16", name: "orange" },
	]

	const themes = [
		{
			value: "system",
			label: "System preference",
			component: System,
		},
		{
			value: "light",
			label: "Light mode",
			component: Light,
		},
		{
			value: "dark",
			label: "Dark mode",
			component: Dark,
		},
	]

	// Apply theme immediately for preview
	const handleThemeChange = (value: Theme) => {
		setSelectedTheme(value)
		setTheme(value)
	}

	// Apply brand color immediately for preview
	const handleBrandColorChange = (value: Color | null) => {
		if (!value) return
		const hexColor = value.toString("hex")
		setSelectedBrandColor(hexColor)
		setBrandColor(hexColor)
	}

	const handleContinue = () => {
		onContinue({
			theme: selectedTheme,
			brandColor: selectedBrandColor,
		})
	}

	const color = parseColor(selectedBrandColor)

	return (
		<div className="space-y-6">
			<CardHeader>
				<CardTitle>Choose your theme</CardTitle>
				<CardDescription>Customize how Hazel looks and feels for you</CardDescription>
			</CardHeader>

			<div className="space-y-6">
				{/* Brand Color Selection */}
				<div className="space-y-3">
					<p className="block font-medium text-sm">Brand color</p>
					<p className="text-muted-fg text-sm">Select your preferred accent color</p>
					<RadioGroup
						aria-label="Brand color"
						value={color?.toString("hex")}
						onChange={(value) => {
							const newColor = parseColor(value)
							handleBrandColorChange(newColor)
						}}
						className="flex items-center"
					>
						<div className="flex gap-2">
							{colorSwatches.map((swatch) => (
								<Radio
									key={swatch.hex}
									value={swatch.hex}
									aria-label={parseColor(swatch.hex).getColorName("en-US")}
								>
									{({ isSelected, isFocused }) => (
										<ColorSwatch
											id={`color-${swatch.hex}`}
											color={swatch.hex}
											className={cn(
												"-outline-offset-1 size-7 cursor-pointer rounded-full outline-1 outline-black/10",
												(isSelected || isFocused) &&
													"ring-2 ring-ring ring-offset-2 ring-offset-bg",
											)}
										/>
									)}
								</Radio>
							))}
						</div>
					</RadioGroup>
				</div>

				<hr className="h-px w-full border-none bg-border" />

				{/* Theme Mode Selection */}
				<div className="space-y-3">
					<p className="block font-medium text-sm">Display preference</p>
					<p className="text-muted-fg text-sm">Switch between light and dark modes</p>
					<div className="-mx-4 overflow-auto px-4 pt-2">
						<RadioGroup
							aria-label="Display preference"
							className="flex gap-5"
							value={selectedTheme}
							onChange={(value) => handleThemeChange(value as Theme)}
						>
							{themes.map((themeOption) => (
								<Radio
									key={themeOption.value}
									value={themeOption.value}
									aria-label={themeOption.label}
									className="flex cursor-pointer flex-col gap-3"
								>
									{({ isSelected, isFocusVisible }) => (
										<>
											<section
												className={cn(
													"relative h-33 w-50 rounded-[10px] bg-secondary",
													isSelected && "outline-2 outline-ring outline-offset-2",
												)}
											>
												<themeOption.component className="size-full" />

												{isSelected && (
													<div
														className={cn(
															"absolute bottom-2 left-2 flex size-5 items-center justify-center rounded-full border-2 border-fg bg-primary",
															isFocusVisible &&
																"ring-2 ring-ring ring-offset-2",
														)}
													>
														<div className="size-2.5 rounded-full bg-fg" />
													</div>
												)}
											</section>
											<section className="w-full">
												<p className="font-semibold text-fg text-sm">
													{themeOption.label}
												</p>
											</section>
										</>
									)}
								</Radio>
							))}
						</RadioGroup>
					</div>
				</div>
			</div>

			<OnboardingNavigation onBack={onBack} onContinue={handleContinue} canContinue={true} />
		</div>
	)
}
