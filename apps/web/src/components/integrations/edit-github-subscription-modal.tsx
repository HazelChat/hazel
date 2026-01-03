import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import type { GitHubSubscription } from "@hazel/domain/models"
import type { GitHubSubscriptionId } from "@hazel/schema"
import { useState } from "react"
import {
	type GitHubSubscriptionData,
	updateGitHubSubscriptionMutation,
} from "~/atoms/github-subscription-atoms"
import { resolvedThemeAtom } from "~/components/theme-provider"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input, InputGroup } from "~/components/ui/input"
import {
	Modal,
	ModalBody,
	ModalClose,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "~/components/ui/modal"
import { Switch, SwitchLabel } from "~/components/ui/switch"
import { matchExitWithToast } from "~/lib/toast-exit"
import { getProviderIconUrl } from "../embeds/use-embed-theme"

type GitHubEventType = typeof GitHubSubscription.GitHubEventType.Type

const EVENT_OPTIONS: { id: GitHubEventType; label: string; description: string }[] = [
	{ id: "push", label: "Push", description: "Commits pushed to branches" },
	{ id: "pull_request", label: "Pull Requests", description: "PR opened, closed, or merged" },
	{ id: "issues", label: "Issues", description: "Issue opened, closed, or commented" },
	{ id: "release", label: "Releases", description: "New releases published" },
	{ id: "deployment_status", label: "Deployments", description: "Deployment status changes" },
	{ id: "workflow_run", label: "Workflows", description: "GitHub Actions workflow runs" },
]

interface EditGitHubSubscriptionModalProps {
	subscription: GitHubSubscriptionData
	channelName: string
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

export function EditGitHubSubscriptionModal({
	subscription,
	channelName,
	isOpen,
	onClose,
	onSuccess,
}: EditGitHubSubscriptionModalProps) {
	const [enabledEvents, setEnabledEvents] = useState<GitHubEventType[]>(
		subscription.enabledEvents as GitHubEventType[],
	)
	const [branchFilter, setBranchFilter] = useState(subscription.branchFilter ?? "")
	const [isEnabled, setIsEnabled] = useState(subscription.isEnabled)
	const [isSaving, setIsSaving] = useState(false)

	const resolvedTheme = useAtomValue(resolvedThemeAtom)
	const updateSubscription = useAtomSet(updateGitHubSubscriptionMutation, { mode: "promiseExit" })

	const handleToggleEvent = (eventId: GitHubEventType) => {
		setEnabledEvents((prev) =>
			prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId],
		)
	}

	const handleSubmit = async () => {
		if (enabledEvents.length === 0) return

		setIsSaving(true)
		const exit = await updateSubscription({
			payload: {
				id: subscription.id as GitHubSubscriptionId,
				enabledEvents: [...enabledEvents],
				branchFilter: branchFilter.trim() || null,
				isEnabled,
			},
		})

		matchExitWithToast(exit, {
			onSuccess: () => {
				onSuccess()
				onClose()
			},
			successMessage: "Subscription updated",
			customErrors: {
				GitHubSubscriptionNotFoundError: () => ({
					title: "Subscription not found",
					description: "This subscription may have been deleted.",
					isRetryable: false,
				}),
			},
		})
		setIsSaving(false)
	}

	const handleClose = () => {
		// Reset to original values
		setEnabledEvents(subscription.enabledEvents as GitHubEventType[])
		setBranchFilter(subscription.branchFilter ?? "")
		setIsEnabled(subscription.isEnabled)
		onClose()
	}

	const hasChanges =
		JSON.stringify([...enabledEvents].sort()) !==
			JSON.stringify([...(subscription.enabledEvents as GitHubEventType[])].sort()) ||
		(branchFilter.trim() || null) !== (subscription.branchFilter ?? null) ||
		isEnabled !== subscription.isEnabled

	return (
		<Modal isOpen={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Edit GitHub Subscription</ModalTitle>
				</ModalHeader>

				<ModalBody>
					<div className="flex flex-col gap-5">
						{/* Repository info (read-only) */}
						<div className="flex items-center gap-3 rounded-lg border border-border bg-bg-muted/30 p-3">
							<img
								src={getProviderIconUrl("github", {
									theme: resolvedTheme === "dark" ? "light" : "dark",
								})}
								alt="GitHub"
								className="size-8 rounded-full object-cover"
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-fg text-sm">
									{subscription.repositoryFullName}
								</p>
								<p className="text-muted-fg text-xs">
									Posting to <span className="font-medium">#{channelName}</span>
								</p>
							</div>
						</div>

						{/* Enable/Disable toggle */}
						<div className="flex items-center justify-between rounded-lg border border-border p-3">
							<div className="flex flex-col gap-0.5">
								<span className="font-medium text-fg text-sm">Subscription Status</span>
								<span className="text-muted-fg text-xs">
									{isEnabled
										? "Events will be posted to the channel"
										: "Events will not be posted"}
								</span>
							</div>
							<SwitchLabel>
								<Switch isSelected={isEnabled} onChange={setIsEnabled} />
							</SwitchLabel>
						</div>

						{/* Event types */}
						<div className="flex flex-col gap-2">
							<label className="font-medium text-fg text-sm">Event Types</label>
							<p className="text-muted-fg text-xs">
								Select which events to receive notifications for.
							</p>
							<div className="grid grid-cols-2 gap-2">
								{EVENT_OPTIONS.map((event) => {
									const isSelected = enabledEvents.includes(event.id)
									return (
										<label
											key={event.id}
											className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
												isSelected
													? "border-accent bg-accent/5"
													: "border-border hover:border-border-hover hover:bg-bg-muted"
											}`}
										>
											<Checkbox
												isSelected={isSelected}
												onChange={() => handleToggleEvent(event.id)}
												className="mt-0.5"
											/>
											<div className="flex flex-col gap-0.5">
												<span className="font-medium text-fg text-sm">
													{event.label}
												</span>
												<span className="text-muted-fg text-xs">
													{event.description}
												</span>
											</div>
										</label>
									)
								})}
							</div>
						</div>

						{/* Branch filter (only for push events) */}
						{enabledEvents.includes("push") && (
							<div className="flex flex-col gap-2">
								<label className="font-medium text-fg text-sm">
									Branch Filter (Optional)
								</label>
								<p className="text-muted-fg text-xs">
									Only receive push events for branches matching this pattern.
								</p>
								<InputGroup>
									<Input
										placeholder="e.g., main, release/*, feature/*"
										value={branchFilter}
										onChange={(e) => setBranchFilter(e.target.value)}
									/>
								</InputGroup>
							</div>
						)}
					</div>
				</ModalBody>

				<ModalFooter>
					<ModalClose intent="secondary">Cancel</ModalClose>
					<Button
						intent="primary"
						onPress={handleSubmit}
						isDisabled={enabledEvents.length === 0 || isSaving || !hasChanges}
					>
						{isSaving ? "Saving..." : "Save Changes"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
