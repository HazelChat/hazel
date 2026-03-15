import { useAtomSet } from "@effect/atom-react"
import type { BotId } from "@hazel/schema"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCallback, useState } from "react"
import { installBotByIdMutation, uninstallBotMutation } from "~/atoms/bot-atoms"
import { BotCard } from "~/components/bots/bot-card"
import IconPlus from "~/components/icons/icon-plus"
import IconRobot from "~/components/icons/icon-robot"
import { Button } from "~/components/ui/button"
import { EmptyState } from "~/components/ui/empty-state"
import { Description, FieldError, Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "~/components/ui/modal"
import { SectionHeader } from "~/components/ui/section-header"
import { TextField } from "~/components/ui/text-field"
import { useInstalledBots } from "~/db/hooks"
import { useAuth } from "~/lib/auth"
import { exitToastAsync } from "~/lib/toast-exit"

export const Route = createFileRoute("/_app/$orgSlug/settings/integrations/installed")({
	component: InstalledAppsSettings,
})

function InstalledAppsSettings() {
	const navigate = useNavigate()
	const { orgSlug } = Route.useParams()
	const { user } = useAuth()

	// Modal state for Install by ID
	const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)
	const [installBotId, setInstallBotId] = useState("")
	const [installError, setInstallError] = useState<string | null>(null)
	const [isInstalling, setIsInstalling] = useState(false)

	// Query installed bots using TanStack DB (real-time via Electric sync)
	const { bots: installedBots, status } = useInstalledBots(user?.organizationId ?? undefined)
	const isLoading = status === "loading" || status === "idle"

	// Mutations
	const uninstallBot = useAtomSet(uninstallBotMutation, { mode: "promiseExit" })
	const installBotById = useAtomSet(installBotByIdMutation, { mode: "promiseExit" })

	// Handle bot uninstallation
	const handleUninstall = useCallback(
		async (botId: string) => {
			await exitToastAsync(
				uninstallBot({
					payload: { botId: botId as BotId },
				}),
			)
				.loading("Uninstalling application...")
				.successMessage("Application uninstalled successfully")
				.onErrorTag("BotNotFoundError", () => ({
					title: "Application not found",
					description: "This application may have already been uninstalled.",
					isRetryable: false,
				}))
				.onErrorTag("RateLimitExceededError", () => ({
					title: "Rate limit exceeded",
					description: "Please wait before trying again.",
					isRetryable: true,
				}))
				.run()
		},
		[uninstallBot],
	)

	// Handle install by ID
	const handleInstallById = async () => {
		if (!installBotId.trim()) {
			setInstallError("Please enter an App ID")
			return
		}

		setIsInstalling(true)
		setInstallError(null)

		await exitToastAsync(
			installBotById({
				payload: { botId: installBotId.trim() as BotId },
			}),
		)
			.loading("Installing application...")
			.onSuccess(() => {
				setIsInstallModalOpen(false)
				setInstallBotId("")
			})
			.successMessage("Application installed successfully")
			.onErrorTag("BotNotFoundError", () => {
				setInstallError("Application not found. Please check the ID and try again.")
				return { title: "Application not found", isRetryable: false }
			})
			.onErrorTag("BotAlreadyInstalledError", () => {
				setInstallError("This application is already installed in your workspace.")
				return { title: "Already installed", isRetryable: false }
			})
			.onErrorTag("RateLimitExceededError", () => ({
				title: "Rate limit exceeded",
				description: "Please wait before trying again.",
				isRetryable: true,
			}))
			.run()

		setIsInstalling(false)
	}

	return (
		<>
			<SectionHeader.Root className="border-none pb-0">
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-1">
						<SectionHeader.Heading>Installed Apps</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Manage applications installed in your workspace.
						</SectionHeader.Subheading>
					</div>
					<Button intent="outline" onPress={() => setIsInstallModalOpen(true)}>
						<IconPlus className="size-4" />
						Install by ID
					</Button>
				</SectionHeader.Group>
			</SectionHeader.Root>

			{/* Install by ID Modal */}
			<Modal
				isOpen={isInstallModalOpen}
				onOpenChange={(open) => {
					setIsInstallModalOpen(open)
					if (!open) {
						setInstallBotId("")
						setInstallError(null)
					}
				}}
			>
				<ModalContent>
					<ModalHeader>
						<ModalTitle>Install Application by ID</ModalTitle>
						<ModalDescription>
							Enter the application ID to install it in your workspace. You can get this ID from
							the app creator.
						</ModalDescription>
					</ModalHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							handleInstallById()
						}}
					>
						<ModalBody>
							<TextField>
								<Label>Application ID</Label>
								<Description>
									The unique identifier for the application (UUID format)
								</Description>
								<Input
									placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
									value={installBotId}
									onChange={(e) => {
										setInstallBotId(e.target.value)
										setInstallError(null)
									}}
									aria-invalid={!!installError}
								/>
								{installError && <FieldError>{installError}</FieldError>}
							</TextField>
						</ModalBody>
						<ModalFooter>
							<Button
								intent="outline"
								onPress={() => setIsInstallModalOpen(false)}
								type="button"
							>
								Cancel
							</Button>
							<Button
								intent="primary"
								type="submit"
								isDisabled={isInstalling || !installBotId.trim()}
							>
								{isInstalling ? "Installing..." : "Install"}
							</Button>
						</ModalFooter>
					</form>
				</ModalContent>
			</Modal>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="size-8 animate-spin rounded-full border-4 border-border border-t-primary" />
				</div>
			) : installedBots.length === 0 ? (
				<EmptyState
					icon={IconRobot}
					title="No installed applications"
					description="Browse the Marketplace to find and install applications for your workspace."
					action={
						<Button
							intent="primary"
							onPress={() =>
								navigate({
									to: "/$orgSlug/settings/integrations/marketplace",
									params: { orgSlug },
								})
							}
						>
							Browse Marketplace
						</Button>
					}
				/>
			) : (
				<div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{installedBots.map((bot) => (
						<BotCard
							key={bot.id}
							bot={bot}
							showUninstall
							onUninstall={() => handleUninstall(bot.id)}
						/>
					))}
				</div>
			)}
		</>
	)
}
