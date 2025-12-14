import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { GitHubSubscriptionId } from "@hazel/schema"
import { useState } from "react"
import {
	deleteGitHubSubscriptionMutation,
	type GitHubSubscriptionData,
	updateGitHubSubscriptionMutation,
} from "~/atoms/github-subscription-atoms"
import { IconCirclePause } from "~/components/icons/icon-circle-pause"
import IconDotsVertical from "~/components/icons/icon-dots-vertical"
import IconTrash from "~/components/icons/icon-trash"
import { resolvedThemeAtom } from "~/components/theme-provider"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from "~/components/ui/menu"
import { matchExitWithToast } from "~/lib/toast-exit"
import { getProviderIconUrl } from "../embeds/use-embed-theme"
import { IconPlay } from "../icons/icon-play"

const EVENT_LABELS: Record<string, string> = {
	push: "Push",
	pull_request: "Pull Requests",
	issues: "Issues",
	release: "Releases",
	deployment_status: "Deployments",
	workflow_run: "Workflows",
}

interface GitHubSubscriptionItemProps {
	subscription: GitHubSubscriptionData
	onUpdate: () => void
}

export function GitHubSubscriptionItem({ subscription, onUpdate }: GitHubSubscriptionItemProps) {
	const [confirmDelete, setConfirmDelete] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isToggling, setIsToggling] = useState(false)

	// Use theme-aware GitHub logo (invert: dark UI needs light logo, light UI needs dark logo)
	const resolvedTheme = useAtomValue(resolvedThemeAtom)

	const deleteSubscription = useAtomSet(deleteGitHubSubscriptionMutation, { mode: "promiseExit" })
	const updateSubscription = useAtomSet(updateGitHubSubscriptionMutation, { mode: "promiseExit" })

	const handleToggle = async () => {
		setIsToggling(true)
		const exit = await updateSubscription({
			payload: {
				id: subscription.id as GitHubSubscriptionId,
				isEnabled: !subscription.isEnabled,
			},
		})

		matchExitWithToast(exit, {
			onSuccess: () => onUpdate(),
			successMessage: subscription.isEnabled ? "Subscription disabled" : "Subscription enabled",
			customErrors: {
				GitHubSubscriptionNotFoundError: () => ({
					title: "Subscription not found",
					description: "This subscription may have been deleted.",
					isRetryable: false,
				}),
			},
		})
		setIsToggling(false)
	}

	const handleDelete = async () => {
		if (!confirmDelete) {
			setConfirmDelete(true)
			setTimeout(() => setConfirmDelete(false), 3000)
			return
		}

		setIsDeleting(true)
		const exit = await deleteSubscription({
			payload: { id: subscription.id as GitHubSubscriptionId },
		})

		matchExitWithToast(exit, {
			onSuccess: () => onUpdate(),
			successMessage: "Subscription removed",
			customErrors: {
				GitHubSubscriptionNotFoundError: () => ({
					title: "Subscription not found",
					description: "This subscription may have already been deleted.",
					isRetryable: false,
				}),
			},
		})
		setIsDeleting(false)
	}

	const enabledEventLabels = subscription.enabledEvents
		.map((e) => EVENT_LABELS[e] ?? e)
		.slice(0, 3)
		.join(", ")
	const remainingCount = subscription.enabledEvents.length - 3

	return (
		<div className="group flex items-center gap-3 rounded-lg border border-border bg-bg p-3 transition-all hover:border-border-hover hover:bg-bg-muted/50 hover:shadow-sm">
			<img
				src={getProviderIconUrl("github", { theme: resolvedTheme === "dark" ? "light" : "dark" })}
				alt="GitHub"
				className="size-8 rounded-full object-cover"
			/>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="truncate font-medium text-fg text-sm">
						{subscription.repositoryFullName}
					</span>
					<Badge intent={subscription.isEnabled ? "success" : "secondary"} className="shrink-0">
						{subscription.isEnabled ? "Active" : "Disabled"}
					</Badge>
				</div>
				<div className="flex items-center gap-2 text-muted-fg text-xs">
					<span className="truncate">
						{enabledEventLabels}
						{remainingCount > 0 && ` +${remainingCount} more`}
					</span>
					{subscription.branchFilter && (
						<>
							<span className="text-muted-fg/50">·</span>
							<span className="font-mono">{subscription.branchFilter}</span>
						</>
					)}
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-1">
				<Menu>
					<Button intent="plain" size="sq-xs" className="text-muted-fg">
						<IconDotsVertical className="size-4" />
					</Button>
					<MenuContent placement="bottom end">
						<MenuItem onAction={handleToggle} isDisabled={isToggling}>
							{subscription.isEnabled ? (
								<IconCirclePause className="size-4" />
							) : (
								<IconPlay className="size-4" />
							)}
							<MenuLabel>{subscription.isEnabled ? "Disable" : "Enable"}</MenuLabel>
						</MenuItem>
						<MenuSeparator />
						<MenuItem intent="danger" onAction={handleDelete} isDisabled={isDeleting}>
							<IconTrash className="size-4" />
							<MenuLabel>{confirmDelete ? "Confirm delete?" : "Remove"}</MenuLabel>
						</MenuItem>
					</MenuContent>
				</Menu>
			</div>
		</div>
	)
}
