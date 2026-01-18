import { useAtomSet } from "@effect-atom/atom-react"
import type { BotId } from "@hazel/schema"
import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useDeferredValue, useMemo, useState } from "react"
import { installBotMutation } from "~/atoms/bot-atoms"
import { MarketplaceBotCard } from "~/components/bots/marketplace-bot-card"
import IconMagnifier from "~/components/icons/icon-magnifier-3"
import IconRobot from "~/components/icons/icon-robot"
import { EmptyState } from "~/components/ui/empty-state"
import { Input, InputGroup } from "~/components/ui/input"
import { SectionHeader } from "~/components/ui/section-header"
import { usePublicBots } from "~/db/hooks"
import { useAuth } from "~/lib/auth"
import { toastExit } from "~/lib/toast-exit"

export const Route = createFileRoute("/_app/$orgSlug/settings/integrations/marketplace")({
	component: MarketplaceSettings,
})

function MarketplaceSettings() {
	const [search, setSearch] = useState("")
	const deferredSearch = useDeferredValue(search)
	const { user } = useAuth()

	// Query public bots using TanStack DB (real-time via Electric sync)
	const { bots: allPublicBots, status } = usePublicBots(user?.organizationId ?? undefined)
	const isLoading = status === "loading" || status === "idle"

	// Filter bots by search term locally
	const publicBots = useMemo(() => {
		if (!deferredSearch) return allPublicBots
		const searchLower = deferredSearch.toLowerCase()
		return allPublicBots.filter(
			(bot) =>
				bot.name.toLowerCase().includes(searchLower) ||
				bot.description?.toLowerCase().includes(searchLower),
		)
	}, [allPublicBots, deferredSearch])

	// Mutation for installing
	const installBot = useAtomSet(installBotMutation, { mode: "promiseExit" })

	// Handle bot installation
	const handleInstall = useCallback(
		async (botId: string) => {
			await toastExit(
				installBot({
					payload: { botId: botId as BotId },
				}),
				{
					loading: "Installing application...",
					success: () => "Application installed successfully",
					customErrors: {
						BotNotFoundError: () => ({
							title: "Application not found",
							description: "This application may no longer be available.",
							isRetryable: false,
						}),
						BotAlreadyInstalledError: () => ({
							title: "Already installed",
							description: "This application is already installed in your workspace.",
							isRetryable: false,
						}),
						RateLimitExceededError: () => ({
							title: "Rate limit exceeded",
							description: "Please wait before trying again.",
							isRetryable: true,
						}),
					},
				},
			)
		},
		[installBot],
	)

	return (
		<>
			<SectionHeader.Root className="border-none pb-0">
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-1">
						<SectionHeader.Heading>Marketplace</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Discover and install community applications for your workspace.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			<div className="flex flex-col gap-6">
				<InputGroup className="max-w-md">
					<IconMagnifier data-slot="icon" />
					<Input
						placeholder="Search applications..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</InputGroup>

				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<div className="size-8 animate-spin rounded-full border-4 border-border border-t-primary" />
					</div>
				) : publicBots.length === 0 ? (
					<EmptyState
						icon={IconRobot}
						title="No applications found"
						description={
							search
								? "Try a different search term"
								: "Be the first to publish an application to the marketplace!"
						}
					/>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{publicBots.map((bot) => (
							<MarketplaceBotCard
								key={bot.id}
								bot={bot}
								onInstall={() => handleInstall(bot.id)}
							/>
						))}
					</div>
				)}
			</div>
		</>
	)
}
