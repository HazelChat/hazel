import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelId, RssSubscriptionId } from "@hazel/schema"
import { useCallback, useEffect, useRef, useState } from "react"
import {
	deleteRssSubscriptionMutation,
	listRssSubscriptionsMutation,
	type RssSubscriptionData,
	updateRssSubscriptionMutation,
} from "~/atoms/rss-subscription-atoms"
import IconDotsVertical from "~/components/icons/icon-dots-vertical"
import IconPlus from "~/components/icons/icon-plus"
import IconTrash from "~/components/icons/icon-trash"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from "~/components/ui/menu"
import { Modal, ModalClose, ModalContent, ModalFooter, ModalHeader } from "~/components/ui/modal"
import { exitToast } from "~/lib/toast-exit"
import { IconCirclePause } from "../icons/icon-circle-pause"
import { IconPlay } from "../icons/icon-play"
import { AddRssFeedModal } from "./add-rss-feed-modal"

interface RssIntegrationCardProps {
	channelId: ChannelId
}

export function RssIntegrationCard({ channelId }: RssIntegrationCardProps) {
	const [subscriptions, setSubscriptions] = useState<RssSubscriptionData[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const listSubscriptions = useAtomSet(listRssSubscriptionsMutation, { mode: "promiseExit" })
	const listSubscriptionsRef = useRef(listSubscriptions)
	listSubscriptionsRef.current = listSubscriptions

	const fetchSubscriptions = useCallback(async () => {
		setIsLoading(true)
		const exit = await listSubscriptionsRef.current({
			payload: { channelId },
		})

		exitToast(exit)
			.onSuccess((result) => setSubscriptions(result.data as unknown as RssSubscriptionData[]))
			.onErrorTag("ChannelNotFoundError", () => ({
				title: "Channel not found",
				description: "This channel may have been deleted.",
				isRetryable: false,
			}))
			.run()
		setIsLoading(false)
	}, [channelId])

	useEffect(() => {
		fetchSubscriptions()
	}, [fetchSubscriptions])

	return (
		<>
			<div className="rounded-xl border border-border bg-bg">
				<div className="flex items-center justify-between border-border border-b p-4">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-lg bg-[#F26522]/10">
							<RssIcon className="size-5 text-[#F26522]" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="font-medium text-fg">RSS Feeds</span>
								{subscriptions.length > 0 && (
									<Badge intent="success">
										{subscriptions.length} {subscriptions.length === 1 ? "feed" : "feeds"}
									</Badge>
								)}
							</div>
							<p className="text-muted-fg text-sm">Subscribe to RSS and Atom feeds</p>
						</div>
					</div>
					<Button intent="primary" size="sm" onPress={() => setIsModalOpen(true)}>
						<IconPlus className="size-4" />
						Add Feed
					</Button>
				</div>

				<div className="p-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-6">
							<div className="size-5 animate-spin rounded-full border-2 border-muted-fg/30 border-t-primary" />
						</div>
					) : subscriptions.length === 0 ? (
						<div className="rounded-lg border border-border border-dashed py-6 text-center">
							<p className="text-muted-fg text-sm">No RSS feeds subscribed</p>
							<p className="mt-1 text-muted-fg/70 text-xs">
								Add a feed to receive new articles in this channel
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-2">
							{subscriptions.map((subscription) => (
								<RssSubscriptionItem
									key={subscription.id}
									subscription={subscription}
									onUpdate={fetchSubscriptions}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			<AddRssFeedModal
				channelId={channelId}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={fetchSubscriptions}
			/>
		</>
	)
}

const INTERVAL_LABELS: Record<number, string> = {
	5: "5 min",
	15: "15 min",
	30: "30 min",
	60: "1 hr",
}

function RssSubscriptionItem({
	subscription,
	onUpdate,
}: {
	subscription: RssSubscriptionData
	onUpdate: () => void
}) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isToggling, setIsToggling] = useState(false)

	const deleteSubscription = useAtomSet(deleteRssSubscriptionMutation, { mode: "promiseExit" })
	const updateSubscription = useAtomSet(updateRssSubscriptionMutation, { mode: "promiseExit" })

	const handleToggle = async () => {
		setIsToggling(true)
		const exit = await updateSubscription({
			payload: {
				id: subscription.id as RssSubscriptionId,
				isEnabled: !subscription.isEnabled,
			},
		})

		exitToast(exit)
			.onSuccess(() => onUpdate())
			.successMessage(subscription.isEnabled ? "Feed paused" : "Feed resumed")
			.onErrorTag("RssSubscriptionNotFoundError", () => ({
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
			payload: { id: subscription.id as RssSubscriptionId },
		})

		exitToast(exit)
			.onSuccess(() => onUpdate())
			.successMessage("Feed removed")
			.onErrorTag("RssSubscriptionNotFoundError", () => ({
				title: "Subscription not found",
				description: "This subscription may have already been deleted.",
				isRetryable: false,
			}))
			.run()
		setIsDeleting(false)
		setShowDeleteDialog(false)
	}

	const intervalLabel =
		INTERVAL_LABELS[subscription.pollingIntervalMinutes] ?? `${subscription.pollingIntervalMinutes} min`
	const hasError = subscription.consecutiveErrors > 0

	return (
		<div className="flex items-center gap-3 rounded-lg border border-border bg-bg p-3 transition-colors hover:border-border-hover">
			<FeedIcon url={subscription.feedIconUrl} />

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="truncate font-medium text-fg text-sm">
						{subscription.feedTitle || subscription.feedUrl}
					</span>
					{!subscription.isEnabled && <Badge intent="secondary">Paused</Badge>}
					{hasError && (
						<Badge intent="danger">
							{subscription.consecutiveErrors}{" "}
							{subscription.consecutiveErrors === 1 ? "error" : "errors"}
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-2 text-muted-fg text-xs">
					<span className="truncate">{subscription.feedUrl}</span>
					<span className="shrink-0 text-muted-fg/50">·</span>
					<span className="shrink-0">{intervalLabel}</span>
				</div>
			</div>

			<Menu>
				<Button intent="plain" size="sq-xs" className="shrink-0 text-muted-fg">
					<IconDotsVertical className="size-4" />
				</Button>
				<MenuContent placement="bottom end">
					<MenuItem onAction={handleToggle} isDisabled={isToggling}>
						{subscription.isEnabled ? (
							<IconCirclePause className="size-4" />
						) : (
							<IconPlay className="size-4" />
						)}
						<MenuLabel>{subscription.isEnabled ? "Pause" : "Resume"}</MenuLabel>
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
						title="Remove feed?"
						description="This will stop posting updates from this RSS feed."
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
	)
}

function FeedIcon({ url }: { url: string | null }) {
	const [failed, setFailed] = useState(false)

	if (!url || failed) {
		return (
			<div className="flex size-8 items-center justify-center rounded bg-[#F26522]/10">
				<RssIcon className="size-4 text-[#F26522]" />
			</div>
		)
	}

	return <img src={url} alt="" className="size-8 rounded object-cover" onError={() => setFailed(true)} />
}

function RssIcon({ className }: { className?: string }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
			<circle cx="6.18" cy="17.82" r="2.18" />
			<path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
		</svg>
	)
}
