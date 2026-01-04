import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { ChannelId, OrganizationId } from "@hazel/schema"
import { useCallback, useEffect, useRef, useState } from "react"
import {
	type GitHubSubscriptionData,
	listGitHubSubscriptionsMutation,
} from "~/atoms/github-subscription-atoms"
import IconPlus from "~/components/icons/icon-plus"
import { EditGitHubSubscriptionModal } from "~/components/integrations/edit-github-subscription-modal"
import { resolvedThemeAtom } from "~/components/theme-provider"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { useIntegrationConnection } from "~/db/hooks"
import { matchExitWithToast } from "~/lib/toast-exit"
import { getProviderIconUrl } from "../embeds/use-embed-theme"
import { AddGitHubRepoModal } from "./add-github-repo-modal"
import { GitHubSubscriptionItem } from "./github-subscription-card"

interface GitHubIntegrationCardProps {
	channelId: ChannelId
	channelName: string
	organizationId: OrganizationId | null
	orgSlug: string
}

export function GitHubIntegrationCard({ channelId, channelName, organizationId, orgSlug }: GitHubIntegrationCardProps) {
	const [subscriptions, setSubscriptions] = useState<GitHubSubscriptionData[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingSubscription, setEditingSubscription] = useState<GitHubSubscriptionData | null>(null)

	// Check if GitHub is connected for the organization
	const { isConnected: isGitHubConnected } = useIntegrationConnection(organizationId, "github")

	const listSubscriptions = useAtomSet(listGitHubSubscriptionsMutation, { mode: "promiseExit" })
	const listSubscriptionsRef = useRef(listSubscriptions)
	listSubscriptionsRef.current = listSubscriptions

	const fetchSubscriptions = useCallback(async () => {
		setIsLoading(true)
		const exit = await listSubscriptionsRef.current({
			payload: { channelId },
		})

		matchExitWithToast(exit, {
			onSuccess: (result) => setSubscriptions(result.data as unknown as GitHubSubscriptionData[]),
			customErrors: {
				ChannelNotFoundError: () => ({
					title: "Channel not found",
					description: "This channel may have been deleted.",
					isRetryable: false,
				}),
			},
		})
		setIsLoading(false)
	}, [channelId])

	useEffect(() => {
		if (isGitHubConnected) {
			fetchSubscriptions()
		} else {
			setIsLoading(false)
		}
	}, [fetchSubscriptions, isGitHubConnected])

	// Use theme-aware GitHub logo (invert: dark UI needs light logo, light UI needs dark logo)
	const resolvedTheme = useAtomValue(resolvedThemeAtom)
	const logoUrl = getProviderIconUrl("github", { theme: resolvedTheme === "dark" ? "light" : "dark" })

	// Not connected state
	if (!isGitHubConnected) {
		return (
			<div className="rounded-xl border border-border bg-bg p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<img src={logoUrl} alt="GitHub" className="size-10 rounded-lg" />
						<div>
							<div className="flex items-center gap-2">
								<span className="font-medium text-fg">GitHub</span>
							</div>
							<p className="text-muted-fg text-sm">Receive repository events in this channel</p>
						</div>
					</div>
					<Button
						intent="secondary"
						size="sm"
						onPress={() => {
							window.location.href = `/${orgSlug}/settings/integrations/github`
						}}
					>
						Connect GitHub
					</Button>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="rounded-xl border border-border bg-bg">
				<div className="flex items-center justify-between border-border border-b p-4">
					<div className="flex items-center gap-3">
						<img src={logoUrl} alt="GitHub" className="size-10 rounded-lg" />
						<div>
							<div className="flex items-center gap-2">
								<span className="font-medium text-fg">GitHub</span>
								{subscriptions.length > 0 && (
									<Badge intent="success">{subscriptions.length} repos</Badge>
								)}
							</div>
							<p className="text-muted-fg text-sm">Receive repository events in this channel</p>
						</div>
					</div>
					<Button intent="primary" size="sm" onPress={() => setIsModalOpen(true)}>
						<IconPlus className="size-4" />
						Add Repo
					</Button>
				</div>

				<div className="p-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-6">
							<div className="size-5 animate-spin rounded-full border-2 border-muted-fg/30 border-t-primary" />
						</div>
					) : subscriptions.length === 0 ? (
						<div className="rounded-lg border border-border border-dashed py-6 text-center">
							<p className="text-muted-fg text-sm">No repositories subscribed</p>
							<p className="mt-1 text-muted-fg/70 text-xs">
								Add a repository to receive events in this channel
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-2">
							{subscriptions.map((subscription) => (
								<GitHubSubscriptionItem
									key={subscription.id}
									subscription={subscription}
									onUpdate={fetchSubscriptions}
									onEdit={(sub) => setEditingSubscription(sub)}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{organizationId && (
				<AddGitHubRepoModal
					channelId={channelId}
					organizationId={organizationId}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSuccess={fetchSubscriptions}
				/>
			)}

			{editingSubscription && (
				<EditGitHubSubscriptionModal
					subscription={editingSubscription}
					channelName={channelName}
					isOpen={true}
					onClose={() => setEditingSubscription(null)}
					onSuccess={fetchSubscriptions}
				/>
			)}
		</>
	)
}
