import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import type { Color } from "react-aria-components"
import { ColorSwatch, parseColor, Radio, RadioGroup } from "react-aria-components"
import { Dark, Light, System } from "~/components/modals/appearances"
import { type Theme, useTheme } from "~/components/theme-provider"
import { SectionHeader } from "~/components/ui/section-header"
import { SectionLabel } from "~/components/ui/section-label"
import { Switch, SwitchLabel } from "~/components/ui/switch"
import { isTauri } from "~/lib/tauri"
import { disableAutostart, enableAutostart, isAutostartEnabled } from "~/lib/tauri-autostart"
import { cn } from "~/lib/utils"

export const Route = createFileRoute("/_app/$orgSlug/my-settings/")({
	component: AppearanceSettings,
})

function AppearanceSettings() {
	const [autostartEnabled, setAutostartEnabled] = useState<boolean | null>(null)

	// Load autostart state on mount (only in Tauri)
	useEffect(() => {
		if (isTauri()) {
			isAutostartEnabled().then(setAutostartEnabled)
		}
	}, [])

	const handleAutostartToggle = async (isSelected: boolean) => {
		if (isSelected) {
			await enableAutostart()
		} else {
			await disableAutostart()
		}
		setAutostartEnabled(isSelected)
	}

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

	const { theme, setTheme, brandColor, setBrandColor } = useTheme()

	// Convert hex string to Color object for react-aria-components
	const color = parseColor(brandColor)

	const handleColorChange = (value: Color | null) => {
		if (!value) return
		// Update brand color atom (automatically persists to localStorage)
		setBrandColor(value.toString("hex"))
	}

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

	return (
		<form
			className="flex flex-col gap-6 px-4 lg:px-8"
			onSubmit={(e) => {
				e.preventDefault()
			}}
		>
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
						<SectionHeader.Heading>Appearance</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Change how your dashboard looks and feels.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			{/* Form content */}
			<div className="flex flex-col gap-5">
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Brand color"
						description="Select or customize your brand color."
					/>

					<div className="flex flex-col gap-3 md:flex-row md:items-center">
						<RadioGroup
							aria-label="Brand color"
							value={color?.toString("hex")}
							onChange={(value) => {
								const newColor = parseColor(value)
								handleColorChange(newColor)
							}}
							className="flex flex-col items-start gap-4 md:flex-row md:items-center"
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
												id={"color-${swatch.hex}"}
												color={swatch.hex}
												className={cn(
													"size-7 cursor-pointer rounded-full outline-1 outline-black/10 -outline-offset-1",
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
				</div>

				<hr className="h-px w-full border-none bg-border" />

				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Display preference"
						description="Switch between light and dark modes."
					/>

					<div className="-mx-4 -mb-4 w-screen overflow-auto p-4 lg:w-[calc(100%+48px)]">
						<RadioGroup
							aria-label="Display preference"
							defaultValue="system"
							className="flex gap-5"
							value={theme}
							onChange={(value) => setTheme(value as Theme)}
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

				{/* Autostart Section (Desktop only) */}
				{isTauri() && (
					<>
						<hr className="h-px w-full border-none bg-border" />
						<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
							<SectionLabel.Root
								size="sm"
								title="Launch at Startup"
								description="Automatically start the app when you log in."
							/>
							<div className="flex flex-col gap-4">
								<div className="rounded-lg border border-border bg-secondary/50 p-4">
									<Switch
										isSelected={autostartEnabled ?? false}
										isDisabled={autostartEnabled === null}
										onChange={handleAutostartToggle}
									>
										<SwitchLabel>Open at login</SwitchLabel>
									</Switch>
									<p className="mt-3 text-muted-fg text-sm">
										When enabled, the app will automatically launch when you log in to
										your computer.
									</p>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</form>
	)
}
