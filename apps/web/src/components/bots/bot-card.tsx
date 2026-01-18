import { useAtomSet } from "@effect-atom/atom-react"
import { useState } from "react"
import { deleteBotMutation, regenerateBotTokenMutation } from "~/atoms/bot-atoms"
import { BotAvatar } from "~/components/bots/bot-avatar"
import { BotTokenDisplay } from "~/components/bots/bot-token-display"
import IconArrowPath from "~/components/icons/icon-arrow-path"
import IconCode from "~/components/icons/icon-code"
import IconDotsVertical from "~/components/icons/icon-dots-vertical"
import IconEdit from "~/components/icons/icon-edit"
import IconTrash from "~/components/icons/icon-trash"
import { EditBotModal } from "~/components/modals/edit-bot-modal"
import type { BotWithUser } from "~/db/hooks"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "~/components/ui/menu"
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "~/components/ui/modal"
import { toastExit } from "~/lib/toast-exit"

interface BotCardProps {
	bot: BotWithUser
	showUninstall?: boolean
	onDelete?: () => void
	onUpdate?: () => void
	onUninstall?: () => void
	reactivityKeys?: readonly string[]
}

export function BotCard({
	bot,
	showUninstall,
	onDelete,
	onUpdate,
	onUninstall,
	reactivityKeys,
}: BotCardProps) {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [regeneratedToken, setRegeneratedToken] = useState<string | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isRegenerating, setIsRegenerating] = useState(false)

	const deleteBot = useAtomSet(deleteBotMutation, { mode: "promiseExit" })
	const regenerateToken = useAtomSet(regenerateBotTokenMutation, { mode: "promiseExit" })

	const handleDelete = async () => {
		setIsDeleting(true)
		await toastExit(deleteBot({ payload: { id: bot.id }, reactivityKeys }), {
			loading: "Deleting application...",
			success: () => {
				setShowDeleteConfirm(false)
				onDelete?.()
				return "Application deleted successfully"
			},
			customErrors: {
				BotNotFoundError: () => ({
					title: "Application not found",
					description: "This application may have already been deleted.",
					isRetryable: false,
				}),
			},
		})
		setIsDeleting(false)
	}

	const handleRegenerateToken = async () => {
		setIsRegenerating(true)
		await toastExit(regenerateToken({ payload: { id: bot.id } }), {
			loading: "Regenerating token...",
			success: (result) => {
				setRegeneratedToken(result.token)
				return "Token regenerated successfully"
			},
			customErrors: {
				BotNotFoundError: () => ({
					title: "Application not found",
					description: "This application may have been deleted.",
					isRetryable: false,
				}),
			},
		})
		setIsRegenerating(false)
	}

	const scopeCount = bot.scopes?.length ?? 0

	return (
		<>
			<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg transition-all duration-200 hover:border-border-hover hover:shadow-md">
				{/* Header */}
				<div className="flex items-start gap-3 p-4">
					<BotAvatar size="md" bot={bot} className="bg-primary/10" />
					<div className="flex flex-1 flex-col gap-0.5">
						<div className="flex items-center gap-2">
							<h3 className="font-semibold text-fg text-sm">{bot.name}</h3>
							{bot.isPublic && (
								<Badge intent="secondary" size="sm">
									Public
								</Badge>
							)}
						</div>
						{bot.description && (
							<p className="line-clamp-2 text-muted-fg text-xs">{bot.description}</p>
						)}
					</div>

					{/* Actions */}
					{!showUninstall && (
						<Menu>
							<MenuTrigger aria-label="Bot actions">
								<Button
									size="sm"
									intent="plain"
									className="size-8 p-0 hover:bg-secondary"
									aria-label="Bot actions"
								>
									<IconDotsVertical className="size-4" />
								</Button>
							</MenuTrigger>
							<MenuContent placement="bottom end">
								<MenuItem onAction={() => setShowEditModal(true)}>
									<IconEdit data-slot="icon" className="size-4" />
									<MenuLabel>Edit</MenuLabel>
								</MenuItem>
								<MenuItem onAction={() => setShowRegenerateConfirm(true)}>
									<IconArrowPath data-slot="icon" className="size-4" />
									<MenuLabel>Regenerate Token</MenuLabel>
								</MenuItem>
								<MenuSeparator />
								<MenuItem onAction={() => setShowDeleteConfirm(true)} intent="danger">
									<IconTrash data-slot="icon" className="size-4" />
									<MenuLabel>Delete</MenuLabel>
								</MenuItem>
							</MenuContent>
						</Menu>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between border-border border-t bg-muted/30 px-4 py-3">
					<div className="flex items-center gap-3 text-muted-fg text-xs">
						<span className="flex items-center gap-1">
							<IconCode className="size-3.5" />
							{scopeCount} {scopeCount === 1 ? "scope" : "scopes"}
						</span>
					</div>

					{showUninstall && (
						<Button size="sm" intent="outline" onPress={onUninstall}>
							Uninstall
						</Button>
					)}
				</div>
			</div>

			{/* Edit Modal */}
			<EditBotModal
				isOpen={showEditModal}
				onOpenChange={setShowEditModal}
				bot={bot}
				onSuccess={onUpdate}
				reactivityKeys={reactivityKeys}
			/>

			{/* Delete Confirmation Modal */}
			<Modal isOpen={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<ModalContent>
					<ModalHeader>
						<ModalTitle>Delete Application</ModalTitle>
						<ModalDescription>
							Are you sure you want to delete "{bot.name}"? This action cannot be undone.
						</ModalDescription>
					</ModalHeader>
					<ModalFooter>
						<Button intent="outline" onPress={() => setShowDeleteConfirm(false)}>
							Cancel
						</Button>
						<Button intent="danger" onPress={handleDelete} isDisabled={isDeleting}>
							{isDeleting ? "Deleting..." : "Delete Application"}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Regenerate Token Confirmation Modal */}
			<Modal
				isOpen={showRegenerateConfirm}
				onOpenChange={(open) => {
					if (!open) {
						setShowRegenerateConfirm(false)
						setRegeneratedToken(null)
					}
				}}
			>
				<ModalContent size="lg">
					<ModalHeader>
						<ModalTitle>
							{regeneratedToken ? "New Token Generated" : "Regenerate Token"}
						</ModalTitle>
						<ModalDescription>
							{regeneratedToken
								? "Save this new token now. The old token has been invalidated."
								: "This will invalidate the current token. The application will need to be updated with the new token."}
						</ModalDescription>
					</ModalHeader>
					<ModalBody>
						{regeneratedToken ? (
							<BotTokenDisplay token={regeneratedToken} />
						) : (
							<p className="text-muted-fg text-sm">
								Any applications using the current token will stop working immediately.
							</p>
						)}
					</ModalBody>
					<ModalFooter>
						{regeneratedToken ? (
							<Button
								intent="primary"
								onPress={() => {
									setShowRegenerateConfirm(false)
									setRegeneratedToken(null)
								}}
							>
								Done
							</Button>
						) : (
							<>
								<Button intent="outline" onPress={() => setShowRegenerateConfirm(false)}>
									Cancel
								</Button>
								<Button
									intent="danger"
									onPress={handleRegenerateToken}
									isDisabled={isRegenerating}
								>
									{isRegenerating ? "Regenerating..." : "Regenerate Token"}
								</Button>
							</>
						)}
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	)
}
