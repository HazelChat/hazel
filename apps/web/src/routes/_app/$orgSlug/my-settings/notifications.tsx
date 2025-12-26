import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { createFileRoute } from "@tanstack/react-router"
import { Radio, RadioGroup } from "react-aria-components"
import { doNotDisturbAtom, quietHoursEndAtom, quietHoursStartAtom } from "~/atoms/notification-atoms"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { SectionHeader } from "~/components/ui/section-header"
import { SectionLabel } from "~/components/ui/section-label"
import { Slider, SliderOutput, SliderTrack } from "~/components/ui/slider"
import { Switch, SwitchLabel } from "~/components/ui/switch"
import { TextField } from "~/components/ui/text-field"
import { useNotificationSound } from "~/hooks/use-notification-sound"
import { cn } from "~/lib/utils"

export const Route = createFileRoute("/_app/$orgSlug/my-settings/notifications")({
	component: NotificationSettings,
})

function NotificationSettings() {
	const { settings, updateSettings, testSound } = useNotificationSound()

	const doNotDisturb = useAtomValue(doNotDisturbAtom)
	const setDoNotDisturb = useAtomSet(doNotDisturbAtom)

	const quietHoursStart = useAtomValue(quietHoursStartAtom)
	const setQuietHoursStart = useAtomSet(quietHoursStartAtom)

	const quietHoursEnd = useAtomValue(quietHoursEndAtom)
	const setQuietHoursEnd = useAtomSet(quietHoursEndAtom)

	const soundOptions = [
		{ value: "notification01", label: "Sound 1", description: "Classic notification" },
		{ value: "notification02", label: "Sound 2", description: "Gentle chime" },
		{ value: "notification03", label: "Sound 3", description: "Modern alert" },
	] as const

	return (
		<form className="flex flex-col gap-6 px-4 lg:px-8">
			<SectionHeader.Root>
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-0.5 self-stretch">
						<SectionHeader.Heading>Notifications</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Manage how and when you receive notifications.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			{/* Sound Settings */}
			<div className="flex flex-col gap-5">
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root size="sm" title="Sound settings" description="Notification sounds" />

					<div className="flex flex-col gap-6">
						{/* Enable sounds */}
						<Switch
							isSelected={settings.enabled}
							onChange={(enabled) => updateSettings({ enabled })}
						>
							<SwitchLabel>Enable notification sounds</SwitchLabel>
						</Switch>

						{/* Sound selection */}
						<div className="flex flex-col gap-3">
							<div className="font-medium text-sm">Notification sound</div>
							<RadioGroup
								value={settings.soundFile}
								onChange={(value) =>
									updateSettings({
										soundFile: value as
											| "notification01"
											| "notification02"
											| "notification03"
											| "ping"
											| "chime"
											| "bell"
											| "ding"
											| "pop",
									})
								}
								isDisabled={!settings.enabled}
								className="grid grid-cols-1 gap-3 sm:grid-cols-2"
							>
								{soundOptions.map((option) => (
									<Radio key={option.value} value={option.value} className="cursor-pointer">
										{({ isSelected, isFocusVisible }) => (
											<div
												className={cn(
													"relative flex items-center gap-3 rounded-lg border-2 border-border bg-secondary p-4 transition-all",
													isSelected && "border-ring bg-secondary/50",
													isFocusVisible && "ring-2 ring-ring ring-offset-2",
													!settings.enabled && "cursor-not-allowed opacity-50",
												)}
											>
												{/* Selection indicator - circular radio dot */}
												<div
													className={cn(
														"relative flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
														isSelected
															? "border-primary bg-primary"
															: "border-input bg-bg",
													)}
												>
													{isSelected && (
														<div className="size-2 rounded-full bg-primary-fg" />
													)}
												</div>

												{/* Content */}
												<div className="flex flex-1 flex-col">
													<span className="font-medium text-sm">
														{option.label}
													</span>
													<span className="text-muted-fg text-xs">
														{option.description}
													</span>
												</div>
											</div>
										)}
									</Radio>
								))}
							</RadioGroup>
						</div>

						{/* Volume slider */}
						<div className="flex flex-col gap-2">
							<Slider
								minValue={0}
								maxValue={1}
								step={0.1}
								value={settings.volume}
								onChange={(value) => updateSettings({ volume: value as number })}
								isDisabled={!settings.enabled}
							>
								<div className="flex items-center justify-between">
									<div className="font-medium text-sm">Volume</div>
									<SliderOutput className="text-muted-fg text-sm">
										{({ state }) => `${Math.round((state.values[0] ?? 0) * 100)}%`}
									</SliderOutput>
								</div>
								<SliderTrack />
							</Slider>
						</div>

						{/* Test sound button */}
						<div>
							<Button
								type="button"
								onPress={testSound}
								isDisabled={!settings.enabled}
								className="w-fit"
							>
								Test sound
							</Button>
						</div>
					</div>
				</div>

				<hr className="h-px w-full border-none bg-border" />

				{/* Do Not Disturb */}
				<div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_1fr] lg:gap-8">
					<SectionLabel.Root
						size="sm"
						title="Do not disturb"
						description="Quiet hours and DND mode"
					/>

					<div className="flex flex-col gap-6">
						{/* Enable DND */}
						<Switch
							isSelected={doNotDisturb ?? false}
							onChange={(value) => setDoNotDisturb(value)}
						>
							<SwitchLabel>Enable do not disturb</SwitchLabel>
						</Switch>

						{/* Quiet hours */}
						<div className="flex flex-col gap-3">
							<div className="font-medium text-sm">Quiet hours</div>
							<p className="text-muted-fg text-sm">
								No notifications will be sent during these hours
							</p>

							<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
								<TextField className="flex-1">
									<Label>Start time</Label>
									<Input
										type="time"
										value={quietHoursStart ?? "22:00"}
										onChange={(e) => setQuietHoursStart(e.target.value)}
									/>
								</TextField>
								<TextField className="flex-1">
									<Label>End time</Label>
									<Input
										type="time"
										value={quietHoursEnd ?? "08:00"}
										onChange={(e) => setQuietHoursEnd(e.target.value)}
									/>
								</TextField>
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
	)
}
