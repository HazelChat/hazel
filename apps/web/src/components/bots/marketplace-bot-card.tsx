import { useState } from "react"
import { BotAvatar } from "~/components/bots/bot-avatar"
import type { BotWithUser } from "~/db/hooks"
import IconCheck from "~/components/icons/icon-check"
import IconCode from "~/components/icons/icon-code"
import IconDownload from "~/components/icons/icon-download"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"

export interface PublicBotWithUser extends BotWithUser {
	isInstalled: boolean
	creatorName: string
}

interface MarketplaceBotCardProps {
	bot: PublicBotWithUser
	onInstall: () => void
}

export function MarketplaceBotCard({ bot, onInstall }: MarketplaceBotCardProps) {
	const [isInstalling, setIsInstalling] = useState(false)

	const handleInstall = async () => {
		setIsInstalling(true)
		await onInstall()
		setIsInstalling(false)
	}

	const scopeCount = bot.scopes?.length ?? 0

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg transition-all duration-200 hover:border-border-hover hover:shadow-md">
			{/* Header */}
			<div className="flex flex-1 flex-col gap-4 p-4">
				<div className="flex items-start gap-3">
					<BotAvatar size="lg" bot={bot} className="bg-primary/10 shrink-0" />
					<div className="flex flex-1 flex-col gap-0.5">
						<h3 className="font-semibold text-fg text-sm">{bot.name}</h3>
						<p className="text-muted-fg text-xs">by {bot.creatorName}</p>
					</div>
				</div>

				{/* Description */}
				<p className="line-clamp-2 text-muted-fg text-sm">
					{bot.description || "No description provided"}
				</p>

				{/* Stats */}
				<div className="flex items-center gap-4 text-muted-fg text-xs">
					<span className="flex items-center gap-1">
						<IconDownload className="size-3" />
						{bot.installCount} {bot.installCount === 1 ? "install" : "installs"}
					</span>
					<span className="flex items-center gap-1">
						<IconCode className="size-3" />
						{scopeCount} {scopeCount === 1 ? "scope" : "scopes"}
					</span>
				</div>

				{/* Scopes Preview */}
				{bot.scopes && bot.scopes.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{bot.scopes.slice(0, 3).map((scope) => (
							<Badge key={scope} intent="secondary" size="sm">
								{scope.split(":")[0]}
							</Badge>
						))}
						{bot.scopes.length > 3 && (
							<Badge intent="secondary" size="sm">
								+{bot.scopes.length - 3}
							</Badge>
						)}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="border-border border-t bg-muted/30 px-4 py-3">
				{bot.isInstalled ? (
					<Button intent="outline" className="w-full" isDisabled>
						<IconCheck className="size-4" />
						Installed
					</Button>
				) : (
					<Button
						intent="primary"
						className="w-full"
						onPress={handleInstall}
						isDisabled={isInstalling}
					>
						{isInstalling ? "Installing..." : "Install"}
					</Button>
				)}
			</div>
		</div>
	)
}
