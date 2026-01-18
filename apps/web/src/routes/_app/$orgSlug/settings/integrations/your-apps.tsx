import { Result, useAtomValue } from "@effect-atom/atom-react"
import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useState } from "react"
import { BotCard } from "~/components/bots/bot-card"
import IconPlus from "~/components/icons/icon-plus"
import IconRobot from "~/components/icons/icon-robot"
import { CreateBotModal } from "~/components/modals/create-bot-modal"
import { Button } from "~/components/ui/button"
import { EmptyState } from "~/components/ui/empty-state"
import { SectionHeader } from "~/components/ui/section-header"
import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

export const Route = createFileRoute("/_app/$orgSlug/settings/integrations/your-apps")({
	component: YourAppsSettings,
})

function YourAppsSettings() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

	// Query my bots with proper loading state
	const myBotsResult = useAtomValue(
		HazelRpcClient.query("bot.list", {}, { reactivityKeys: ["myBots"], timeToLive: "30 seconds" }),
	)
	const myBots = Result.getOrElse(myBotsResult, () => ({ data: [] as const })).data
	const isLoading = Result.isInitial(myBotsResult)

	// Refresh lists after bot creation
	const handleBotCreated = useCallback(() => {
		setIsCreateModalOpen(false)
	}, [])

	return (
		<>
			<SectionHeader.Root className="border-none pb-0">
				<SectionHeader.Group>
					<div className="flex flex-1 flex-col justify-center gap-1">
						<SectionHeader.Heading>Your Apps</SectionHeader.Heading>
						<SectionHeader.Subheading>
							Create and manage your own applications to automate tasks and integrate with
							external services.
						</SectionHeader.Subheading>
					</div>
					<Button
						intent="primary"
						size="md"
						className="shrink-0"
						onPress={() => setIsCreateModalOpen(true)}
					>
						<IconPlus data-slot="icon" />
						Create Application
					</Button>
				</SectionHeader.Group>
			</SectionHeader.Root>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="size-8 animate-spin rounded-full border-4 border-border border-t-primary" />
				</div>
			) : myBots.length === 0 ? (
				<EmptyState
					icon={IconRobot}
					title="No applications yet"
					description="Create your first application to automate tasks and integrate with external services."
					action={
						<Button intent="primary" onPress={() => setIsCreateModalOpen(true)}>
							<IconPlus data-slot="icon" />
							Create Application
						</Button>
					}
				/>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{myBots.map((bot) => (
						<BotCard key={bot.id} bot={bot} reactivityKeys={["myBots"]} />
					))}
				</div>
			)}

			<CreateBotModal
				isOpen={isCreateModalOpen}
				onOpenChange={setIsCreateModalOpen}
				onSuccess={handleBotCreated}
				reactivityKeys={["myBots"]}
			/>
		</>
	)
}
