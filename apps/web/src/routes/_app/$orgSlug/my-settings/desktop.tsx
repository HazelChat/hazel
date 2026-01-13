import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { SectionHeader } from "~/components/ui/section-header"
import { SectionLabel } from "~/components/ui/section-label"
import { Switch, SwitchLabel } from "~/components/ui/switch"
import { disableAutostart, enableAutostart, isAutostartEnabled } from "~/lib/tauri-autostart"

export const Route = createFileRoute("/_app/$orgSlug/my-settings/desktop")({
	component: DesktopSettings,
})

function DesktopSettings() {
	const [autostartEnabled, setAutostartEnabled] = useState<boolean | null>(null)

	useEffect(() => {
		isAutostartEnabled().then(setAutostartEnabled)
	}, [])

	const handleAutostartToggle = async (isSelected: boolean) => {
		if (isSelected) {
			await enableAutostart()
		} else {
			await disableAutostart()
		}
		setAutostartEnabled(isSelected)
	}

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
						<SectionHeader.Heading>Desktop</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Settings for the desktop application.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<div className="flex flex-col gap-5">
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
								When enabled, the app will automatically launch when you log in to your
								computer.
							</p>
						</div>
					</div>
				</div>
			</div>
		</form>
	)
}
