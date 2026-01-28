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
import IconEdit from "~/components/icons/icon-edit"
import IconTrash from "~/components/icons/icon-trash"
import { resolvedThemeAtom } from "~/components/theme-provider"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from "~/components/ui/menu"
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader } from "~/components/ui/modal"
import { exitToast } from "~/lib/toast-exit"
import { getProviderIconUrl } from "../embeds/use-embed-theme"
import { IconPlay } from "../icons/icon-play"

const EVENT_LABELS: Record<string, string> = {
	push: "Push",
	pull_request: "Pull Requests",
	issues: "Issues",
	release: "Releases",
	deployment_status: "Deployments",
	workflow_run: "Workflows",
	star: "Stars",
}

interface GitHubSubscriptionItemProps {
	subscription: GitHubSubscriptionData
	onUpdate: () => void
	onEdit?: (subscription: GitHubSubscriptionData) => void
}

export function GitHubSubscriptionItem({ subscription, onUpdate, onEdit }: GitHubSubscriptionItemProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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

		exitToast(exit)
			.onSuccess(() => onUpdate())
			.successMessage(subscription.isEnabled ? "Subscription disabled" : "Subscription enabled")
			.onErrorTag("GitHubSubscriptionNotFoundError", () => ({
				title: "Subscription not found",
				description: "This subscription may have been deleted.",
				isRetryable: false,
			}))
			.run()
		setIsToggling(false)
	}

	const handleDelete = async () => {
		setIsDeleting(true)
		const exit = await deleteSubscription({
			payload: { id: subscription.id as GitHubSubscriptionId },
		})

		exitToast(exit)
			.onSuccess(() => onUpdate())
			.successMessage("Subscription removed")
			.onErrorTag("GitHubSubscriptionNotFoundError", () => ({
				title: "Subscription not found",
				description: "This subscription may have already been deleted.",
				isRetryable: false,
			}))
			.run()
		setIsDeleting(false)
		setShowDeleteDialog(false)
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
						{onEdit && (
							<MenuItem onAction={() => onEdit(subscription)}>
								<IconEdit className="size-4" />
								<MenuLabel>Edit</MenuLabel>
							</MenuItem>
						)}
						<MenuItem onAction={handleToggle} isDisabled={isToggling}>
							{subscription.isEnabled ? (
								<IconCirclePause className="size-4" />
							) : (
								<IconPlay className="size-4" />
							)}
							<MenuLabel>{subscription.isEnabled ? "Disable" : "Enable"}</MenuLabel>
						</MenuItem>
						<MenuSeparator />
						<MenuItem intent="danger" onAction={() => setShowDeleteDialog(true)}>
							<IconTrash className="size-4" />
							<MenuLabel>Remove</MenuLabel>
						</MenuItem>
					</MenuContent>
				</Menu>

				<Modal isOpen={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<ModalContent role="alertdialog" size="xs">
						<ModalHeader
							title="Remove subscription?"
							description="This will stop posting GitHub events to this channel."
						/>
						<ModalFooter>
							<ModalClose>Cancel</ModalClose>
							<Button intent="danger" onPress={handleDelete} isPending={isDeleting}>
								Remove
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			</div>
		</div>
	)
}
