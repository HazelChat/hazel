import { useAtomSet } from "@effect-atom/atom-react"
import type { ChannelId } from "@hazel/schema"
import { useState } from "react"
import { createRssSubscriptionMutation } from "~/atoms/rss-subscription-atoms"
import { Button } from "~/components/ui/button"
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
import { exitToast } from "~/lib/toast-exit"

const POLLING_INTERVAL_OPTIONS = [
	{ value: 5, label: "Every 5 minutes" },
	{ value: 15, label: "Every 15 minutes" },
	{ value: 30, label: "Every 30 minutes" },
	{ value: 60, label: "Every hour" },
]

interface AddRssFeedModalProps {
	channelId: ChannelId
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

export function AddRssFeedModal({ channelId, isOpen, onClose, onSuccess }: AddRssFeedModalProps) {
	const [feedUrl, setFeedUrl] = useState("")
	const [pollingInterval, setPollingInterval] = useState(15)
	const [isCreating, setIsCreating] = useState(false)

	const createSubscription = useAtomSet(createRssSubscriptionMutation, { mode: "promiseExit" })

	const isValidUrl = (() => {
		try {
			const url = new URL(feedUrl.trim())
			return url.protocol === "https:" || url.protocol === "http:"
		} catch {
			return false
		}
	})()

	const handleSubmit = async () => {
		if (!feedUrl.trim() || !isValidUrl) return

		setIsCreating(true)
		const exit = await createSubscription({
			payload: {
				channelId,
				feedUrl: feedUrl.trim(),
				pollingIntervalMinutes: pollingInterval,
			},
		})

		exitToast(exit)
			.onSuccess(() => {
				onSuccess()
				handleClose()
			})
			.successMessage("RSS feed added")
			.onErrorTag("RssSubscriptionExistsError", () => ({
				title: "Already subscribed",
				description: "This channel is already subscribed to this feed URL.",
				isRetryable: false,
			}))
			.onErrorTag("RssFeedValidationError", (error) => ({
				title: "Invalid feed URL",
				description: error.message,
				isRetryable: true,
			}))
			.onErrorTag("ChannelNotFoundError", () => ({
				title: "Channel not found",
				description: "This channel may have been deleted.",
				isRetryable: false,
			}))
			.run()
		setIsCreating(false)
	}

	const handleClose = () => {
		setFeedUrl("")
		setPollingInterval(15)
		onClose()
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<ModalContent size="lg">
				<ModalHeader>
					<ModalTitle>Add RSS Feed</ModalTitle>
				</ModalHeader>

				<ModalBody>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<label className="font-medium text-fg text-sm">Feed URL</label>
							<p className="text-muted-fg text-xs">
								Enter the RSS or Atom feed URL. The feed will be validated when you submit.
							</p>
							<InputGroup>
								<Input
									placeholder="https://example.com/feed.xml"
									value={feedUrl}
									onChange={(e) => setFeedUrl(e.target.value)}
								/>
							</InputGroup>
							{feedUrl.trim() && !isValidUrl && (
								<p className="text-danger text-xs">
									Please enter a valid URL starting with https:// or http://
								</p>
							)}
						</div>

						{isValidUrl && (
							<div className="flex flex-col gap-2">
								<label className="font-medium text-fg text-sm">Polling Interval</label>
								<p className="text-muted-fg text-xs">
									How often to check the feed for new items.
								</p>
								<div className="grid grid-cols-2 gap-2">
									{POLLING_INTERVAL_OPTIONS.map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() => setPollingInterval(option.value)}
											className={`rounded-lg border p-3 text-left text-sm transition-all ${
												pollingInterval === option.value
													? "border-accent bg-accent/5 font-medium text-fg"
													: "border-border text-muted-fg hover:border-border-hover hover:bg-bg-muted"
											}`}
										>
											{option.label}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</ModalBody>

				<ModalFooter>
					<ModalClose intent="secondary">Cancel</ModalClose>
					<Button intent="primary" onPress={handleSubmit} isDisabled={!isValidUrl || isCreating}>
						{isCreating ? "Adding..." : "Add Feed"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
