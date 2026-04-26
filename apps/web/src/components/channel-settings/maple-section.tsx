import { useAtomSet } from "@effect/atom-react"
import type { ChannelId, ChannelWebhookId } from "@hazel/schema"
import { formatDistanceToNow } from "date-fns"
import { Exit } from "effect"
import { useState } from "react"
import { toast } from "sonner"
import {
	createChannelWebhookMutation,
	deleteChannelWebhookMutation,
	updateChannelWebhookMutation,
	type WebhookData,
} from "~/atoms/channel-webhook-atoms"
import IconCheck from "~/components/icons/icon-check"
import IconCopy from "~/components/icons/icon-copy"
import IconTrash from "~/components/icons/icon-trash"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { toDate } from "~/lib/utils"
import { getProviderIconUrl } from "../embeds/use-embed-theme"

const MAPLE_NAME = "Maple"

interface MapleSectionProps {
	channelId: ChannelId
	webhook: WebhookData | null
	onWebhookChange: (operation: "create" | "delete") => void
	onDone?: () => void
	variant?: "modal" | "page"
	onWebhookCreated?: (data: { webhookId: string; token: string }) => void
}

export function MapleSection({
	channelId,
	webhook,
	onWebhookChange,
	onDone,
	variant = "page",
	onWebhookCreated,
}: MapleSectionProps) {
	const mapleLogoUrl = getProviderIconUrl("maple")
	const [isCreating, setIsCreating] = useState(false)
	const [showToken, setShowToken] = useState(false)
	const [createdWebhook, setCreatedWebhook] = useState<{ id: string; token: string } | null>(null)
	const [copied, setCopied] = useState<"url" | "token" | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const createWebhook = useAtomSet(createChannelWebhookMutation, { mode: "promiseExit" })
	const updateWebhook = useAtomSet(updateChannelWebhookMutation, { mode: "promiseExit" })
	const deleteWebhook = useAtomSet(deleteChannelWebhookMutation, { mode: "promiseExit" })

	const webhookUrl = createdWebhook
		? `${import.meta.env.VITE_BACKEND_URL}/webhooks/incoming/${createdWebhook.id}/`
		: webhook
			? `${import.meta.env.VITE_BACKEND_URL}/webhooks/incoming/${webhook.id}/`
			: null
	const displayToken = createdWebhook?.token ?? null

	const handleConnect = async () => {
		setIsCreating(true)
		const exit = await createWebhook({
			payload: {
				channelId,
				name: MAPLE_NAME,
				description: "Maple alert notifications",
				avatarUrl: mapleLogoUrl,
				integrationProvider: "maple",
			},
		})

		Exit.match(exit, {
			onSuccess: (result) => {
				toast.success("Maple webhook created")
				if (onWebhookCreated) {
					onWebhookCreated({ webhookId: result.data.id, token: result.token })
				} else {
					setCreatedWebhook({ id: result.data.id, token: result.token })
					setShowToken(true)
				}
			},
			onFailure: (cause) => {
				console.error("Failed to create webhook:", cause)
				toast.error("Failed to create Maple webhook")
			},
		})
		setIsCreating(false)
	}

	const handleToggleEnabled = async () => {
		if (!webhook) return
		const exit = await updateWebhook({
			payload: {
				id: webhook.id as ChannelWebhookId,
				isEnabled: !webhook.isEnabled,
			},
		})

		Exit.match(exit, {
			onSuccess: () => {
				toast.success(webhook.isEnabled ? "Maple disabled" : "Maple enabled")
				onWebhookChange("create")
			},
			onFailure: () => {
				toast.error("Failed to update webhook")
			},
		})
	}

	const handleDelete = async () => {
		if (!webhook) return
		setIsDeleting(true)
		const exit = await deleteWebhook({
			payload: { id: webhook.id as ChannelWebhookId },
		})

		Exit.match(exit, {
			onSuccess: () => {
				toast.success("Maple webhook deleted")
				onWebhookChange("delete")
			},
			onFailure: () => {
				toast.error("Failed to delete webhook")
			},
		})
		setIsDeleting(false)
	}

	const handleCopy = async (value: string, type: "url" | "token") => {
		const successMessage = type === "url" ? "URL copied" : "Token copied"
		try {
			await navigator.clipboard.writeText(value)
			setCopied(type)
			toast.success(successMessage)
			setTimeout(() => setCopied(null), 2000)
		} catch {
			toast.error("Failed to copy")
		}
	}

	if (showToken && displayToken && webhookUrl) {
		return (
			<div className="rounded-xl border border-warning/30 bg-warning-subtle/30 p-4">
				<div className="flex items-start gap-3">
					<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-warning-subtle">
						<svg
							className="size-4 text-warning-subtle-fg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<div className="flex-1 space-y-4">
						<div>
							<p className="font-medium text-warning-subtle-fg text-sm">
								Copy the webhook URL below and paste it as a Hazel destination in Maple → Alerts →
								Destinations
							</p>
							<p className="mt-1 text-warning-subtle-fg/80 text-xs">
								The full URL includes your secret token. Keep it safe!
							</p>
						</div>

						<div className="space-y-3">
							<div>
								<Label className="mb-1.5 block text-muted-fg text-xs">
									Webhook URL (paste this in Maple)
								</Label>
								<div className="flex gap-2">
									<Input
										value={`${webhookUrl}${displayToken}/maple`}
										readOnly
										className="flex-1 font-mono text-xs"
									/>
									<Button
										intent="outline"
										size="sq-sm"
										onPress={() => handleCopy(`${webhookUrl}${displayToken}/maple`, "url")}
									>
										{copied === "url" ? (
											<IconCheck className="size-4 text-success" />
										) : (
											<IconCopy className="size-4" />
										)}
									</Button>
								</div>
							</div>
						</div>

						<Button
							intent="secondary"
							size="sm"
							onPress={() => {
								setShowToken(false)
								setCreatedWebhook(null)
								onDone?.()
							}}
						>
							Done
						</Button>
					</div>
				</div>
			</div>
		)
	}

	if (!webhook) {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
					<img src={mapleLogoUrl} alt="Maple" className="size-8 rounded" />
					<div className="flex-1">
						<p className="font-medium text-fg text-sm">Connect Maple</p>
						<p className="text-muted-fg text-xs">
							Receive alert triggers and resolves directly in this channel
						</p>
					</div>
				</div>

				<Button intent="primary" size="md" onPress={handleConnect} isDisabled={isCreating}>
					{isCreating ? "Connecting..." : "Connect Maple"}
				</Button>

				<p className="text-muted-fg text-xs">
					After connecting, copy the webhook URL and add it as a Hazel destination in Maple → Alerts →
					Destinations.
				</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<div
				className={`flex items-start justify-between rounded-lg p-4 ${
					variant === "page" ? "border border-border bg-bg" : "bg-secondary/30"
				}`}
			>
				<div className="flex items-start gap-3">
					<img src={mapleLogoUrl} alt="Maple" className="size-8 rounded-lg" />
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<span className="font-medium text-fg">Maple</span>
							<Badge intent={webhook.isEnabled ? "success" : "secondary"}>
								{webhook.isEnabled ? "Active" : "Disabled"}
							</Badge>
						</div>
						<p className="text-muted-fg text-sm">Alert notifications</p>
						{webhook.lastUsedAt && (
							<p className="text-muted-fg text-xs">
								Last alert {formatDistanceToNow(toDate(webhook.lastUsedAt), { addSuffix: true })}
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button intent="outline" size="sm" onPress={handleToggleEnabled}>
						{webhook.isEnabled ? "Disable" : "Enable"}
					</Button>
					<Button
						intent="outline"
						size="sq-sm"
						onPress={handleDelete}
						isDisabled={isDeleting}
						className="text-danger"
					>
						<IconTrash className="size-4" />
					</Button>
				</div>
			</div>

			<div>
				<Label className="mb-1.5 block text-muted-fg text-xs">Webhook URL</Label>
				<div className="flex gap-2">
					<Input
						value={`${webhookUrl}****${webhook.tokenSuffix}/maple`}
						readOnly
						className="flex-1 font-mono text-xs"
					/>
					<Button
						intent="outline"
						size="sq-sm"
						onPress={() => {
							toast.info("Use 'Regenerate Token' to get a new URL with token")
						}}
					>
						<IconCopy className="size-4" />
					</Button>
				</div>
				<p className="mt-1.5 text-muted-fg text-xs">
					Need a new URL?{" "}
					<button type="button" onClick={handleDelete} className="text-primary underline">
						Delete and recreate
					</button>{" "}
					the webhook to get a new token.
				</p>
			</div>
		</div>
	)
}
