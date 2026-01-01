import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { EmptyState } from "~/components/ui/empty-state"
import { SectionHeader } from "~/components/ui/section-header"
import { useAuth } from "~/lib/auth"
import { HazelApiClient } from "~/lib/services/common/atom-client"

// Simple robot icon SVG
function BotIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<rect x="3" y="11" width="18" height="10" rx="2" />
			<circle cx="12" cy="5" r="2" />
			<path d="M12 7v4" />
			<line x1="8" y1="16" x2="8" y2="16" />
			<line x1="16" y1="16" x2="16" y2="16" />
		</svg>
	)
}

export const Route = createFileRoute("/_app/$orgSlug/settings/bots/")({
	component: BotsSettings,
})

function BotsSettings() {
	const { user } = useAuth()
	const orgId = user?.organizationId

	// Fetch available bots
	const botsResult = useAtomValue(
		HazelApiClient.query("bots", "getAvailableBots", {
			path: { orgId: orgId! },
		}),
	)

	// Mutations for install/uninstall
	const installBot = useAtomSet(HazelApiClient.mutation("bots", "installBot"), {
		mode: "promiseExit",
	})
	const uninstallBot = useAtomSet(HazelApiClient.mutation("bots", "uninstallBot"), {
		mode: "promiseExit",
	})

	// Track loading states
	const [loadingBots, setLoadingBots] = useState<Set<string>>(new Set())

	const handleInstall = async (botId: string, botName: string) => {
		if (!orgId) return

		setLoadingBots((prev) => new Set(prev).add(botId))
		const exit = await installBot({
			path: { orgId, botId },
		})

		setLoadingBots((prev) => {
			const next = new Set(prev)
			next.delete(botId)
			return next
		})

		if (exit._tag === "Success") {
			toast.success(`${botName} installed successfully`)
		} else {
			const error = exit.cause._tag === "Fail" ? exit.cause.error : null
			if (error && typeof error === "object" && "_tag" in error) {
				switch (error._tag) {
					case "BotAlreadyInstalledError":
						toast.error(`${botName} is already installed`)
						break
					case "BotNotFoundError":
						toast.error(`${botName} not found`)
						break
					default:
						toast.error(`Failed to install ${botName}`)
				}
			} else {
				toast.error(`Failed to install ${botName}`)
			}
		}
	}

	const handleUninstall = async (botId: string, botName: string) => {
		if (!orgId) return

		setLoadingBots((prev) => new Set(prev).add(botId))
		const exit = await uninstallBot({
			path: { orgId, botId },
		})

		setLoadingBots((prev) => {
			const next = new Set(prev)
			next.delete(botId)
			return next
		})

		if (exit._tag === "Success") {
			toast.success(`${botName} uninstalled successfully`)
		} else {
			toast.error(`Failed to uninstall ${botName}`)
		}
	}

	// Handle loading/error states
	const isLoading = Result.isInitial(botsResult)
	const bots = Result.isSuccess(botsResult) ? botsResult.value.bots : []

	return (
		<div className="flex flex-col gap-6 px-4 lg:px-8">
			<SectionHeader.Root className="border-none pb-0">
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-1">
						<SectionHeader.Heading>Bots</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Install bots to add slash commands and automation to your channels.
						</SectionHeader.Subheading>
					</div>
				</SectionHeader.Group>
			</SectionHeader.Root>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			) : bots.length === 0 ? (
				<EmptyState
					title="No bots available"
					description="There are no bots available to install."
				/>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{bots.map((bot) => (
						<BotCard
							key={bot.id}
							bot={bot}
							loading={loadingBots.has(bot.id)}
							onInstall={() => handleInstall(bot.id, bot.displayName)}
							onUninstall={() => handleUninstall(bot.id, bot.displayName)}
						/>
					))}
				</div>
			)}
		</div>
	)
}

interface BotCardProps {
	bot: {
		id: string
		name: string
		displayName: string
		description: string
		avatar: string | null
		installed: boolean
	}
	loading: boolean
	onInstall: () => void
	onUninstall: () => void
}

function BotCard({ bot, loading, onInstall, onUninstall }: BotCardProps) {
	return (
		<div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-bg">
			<div className="flex flex-1 flex-col gap-4 p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm ring-1 ring-black/8">
							{bot.avatar ? (
								<img
									src={bot.avatar}
									alt={`${bot.displayName} avatar`}
									className="size-10 object-contain"
								/>
							) : (
								<BotIcon className="size-6 text-primary" />
							)}
						</div>
						<div className="flex flex-col gap-0.5">
							<h3 className="font-semibold text-fg text-sm">{bot.displayName}</h3>
							<InstallStatus installed={bot.installed} />
						</div>
					</div>
				</div>
				<p className="text-muted-fg text-sm leading-relaxed">{bot.description}</p>
			</div>
			<div className="flex items-center justify-end border-border border-t bg-bg-muted/50 px-5 py-3">
				{bot.installed ? (
					<Button intent="secondary" size="sm" onPress={onUninstall} isDisabled={loading}>
						{loading ? "Uninstalling..." : "Uninstall"}
					</Button>
				) : (
					<Button intent="primary" size="sm" onPress={onInstall} isDisabled={loading}>
						{loading ? "Installing..." : "Install"}
					</Button>
				)}
			</div>
		</div>
	)
}

function InstallStatus({ installed }: { installed: boolean }) {
	return (
		<div className="flex items-center gap-1.5">
			<div className={`size-1.5 rounded-full ${installed ? "bg-success" : "bg-secondary"}`} />
			<span className={`text-xs ${installed ? "text-success" : "text-muted-fg"}`}>
				{installed ? "Installed" : "Not installed"}
			</span>
		</div>
	)
}
