import { useAtomSet } from "@effect-atom/atom-react"
import { useState } from "react"
import type { AgentSessionId } from "@hazel/schema"
import { Button } from "~/components/ui/button"
import {
	Dialog,
	DialogBody,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog"
import { ModalOverlay, Modal } from "react-aria-components"
import { TextField } from "~/components/ui/text-field"
import { Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { IconWarning } from "~/components/icons/icon-warning"
import { IconCheck } from "~/components/icons/icon-check"
import { IconClose } from "~/components/icons/icon-close"
import { respondToPermissionMutation, type PendingHitlRequest } from "~/atoms/agent-session-atoms"
import { exitToastAsync } from "~/lib/toast-exit"

interface PermissionModalProps {
	sessionId: AgentSessionId
	request: PendingHitlRequest
	isOpen: boolean
	onClose: () => void
}

export function PermissionModal({ sessionId, request, isOpen, onClose }: PermissionModalProps) {
	const [explanation, setExplanation] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const respondToPermission = useAtomSet(respondToPermissionMutation, { mode: "promiseExit" })

	const handleRespond = async (approved: boolean) => {
		setIsSubmitting(true)
		try {
			await exitToastAsync(
				respondToPermission({
					payload: {
						sessionId,
						permissionId: request.id,
						approved,
						explanation: !approved && explanation ? explanation : undefined,
					},
				}),
			)
				.loading(approved ? "Approving..." : "Denying...")
				.successMessage(approved ? "Permission granted" : "Permission denied")
				.onErrorTag("AgentSessionNotFoundError", () => ({
					title: "Session not found",
					description: "This session may have ended.",
					isRetryable: false,
				}))
				.onErrorTag("AgentSessionInvalidStateError", () => ({
					title: "Session not active",
					description: "The session is no longer accepting responses.",
					isRetryable: false,
				}))
				.onErrorTag("SandboxAgentError", (err) => ({
					title: "Agent error",
					description: err.message || "Could not process the response.",
					isRetryable: true,
				}))
				.run()

			onClose()
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<ModalOverlay isOpen={isOpen} onOpenChange={() => {}} isDismissable={false}>
			<Modal>
				<Dialog>
					<DialogHeader>
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-full bg-warning/20">
								<IconWarning className="size-5 fill-warning" />
							</div>
							<div>
								<DialogTitle>Permission Request</DialogTitle>
								<DialogDescription>
									The agent is requesting permission to perform an action.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<DialogBody className="space-y-4">
						<div className="rounded-lg border border-border bg-secondary/50 p-4">
							<p className="text-sm">{request.description}</p>
							{request.command && (
								<pre className="mt-3 overflow-x-auto rounded bg-secondary p-2 font-mono text-xs">
									{request.command}
								</pre>
							)}
						</div>

						<TextField>
							<Label>Explanation (optional, for denial)</Label>
							<Input
								placeholder="Explain why you're denying this request..."
								value={explanation}
								onChange={(e) => setExplanation(e.target.value)}
							/>
						</TextField>
					</DialogBody>

					<DialogFooter>
						<Button
							intent="danger"
							onPress={() => handleRespond(false)}
							isDisabled={isSubmitting}
						>
							<IconClose className="size-4" />
							Deny
						</Button>
						<Button
							intent="primary"
							onPress={() => handleRespond(true)}
							isDisabled={isSubmitting}
						>
							<IconCheck className="size-4" />
							Approve
						</Button>
					</DialogFooter>
				</Dialog>
			</Modal>
		</ModalOverlay>
	)
}
