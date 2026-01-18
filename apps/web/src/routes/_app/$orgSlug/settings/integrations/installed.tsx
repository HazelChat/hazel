import { useAtomSet } from "@effect-atom/atom-react"
import type { BotId } from "@hazel/schema"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCallback } from "react"
import { uninstallBotMutation } from "~/atoms/bot-atoms"
import { BotCard } from "~/components/bots/bot-card"
import IconRobot from "~/components/icons/icon-robot"
import { Button } from "~/components/ui/button"
import { EmptyState } from "~/components/ui/empty-state"
import { SectionHeader } from "~/components/ui/section-header"
import { useInstalledBots } from "~/db/hooks"
import { useAuth } from "~/lib/auth"
import { toastExit } from "~/lib/toast-exit"

export const Route = createFileRoute("/_app/$orgSlug/settings/integrations/installed")({
	component: InstalledAppsSettings,
})

function InstalledAppsSettings() {
	const navigate = useNavigate()
	const { orgSlug } = Route.useParams()
	const { user } = useAuth()

	// Query installed bots using TanStack DB (real-time via Electric sync)
	const { bots: installedBots, status } = useInstalledBots(user?.organizationId ?? undefined)
	const isLoading = status === "loading" || status === "idle"

	// Mutation for uninstalling
	const uninstallBot = useAtomSet(uninstallBotMutation, { mode: "promiseExit" })

	// Handle bot uninstallation
	const handleUninstall = useCallback(
		async (botId: string) => {
			await toastExit(
				uninstallBot({
					payload: { botId: botId as BotId },
				}),
				{
					loading: "Uninstalling application...",
					success: () => "Application uninstalled successfully",
					customErrors: {
						BotNotFoundError: () => ({
							title: "Application not found",
							description: "This application may have already been uninstalled.",
							isRetryable: false,
						}),
					},
				},
			)
		},
		[uninstallBot],
	)

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
				</SectionHeader.Group>
			</SectionHeader.Root>

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
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
