import { useAtomSet } from "@effect-atom/atom-react"
import { useState } from "react"
import type { AgentSessionId } from "@hazel/schema"
import { Button } from "~/components/ui/button"
import {
	ModalContent,
	ModalBody,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "~/components/ui/modal"
import { TextField } from "~/components/ui/text-field"
import { Label } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { IconChatBubble } from "~/components/icons/icon-chat-bubble"
import { IconSend } from "~/components/icons/icon-send"
import { respondToQuestionMutation, type PendingHitlRequest } from "~/atoms/agent-session-atoms"
import { exitToastAsync } from "~/lib/toast-exit"

interface QuestionModalProps {
	sessionId: AgentSessionId
	request: PendingHitlRequest
	isOpen: boolean
	onClose: () => void
}

export function QuestionModal({ sessionId, request, isOpen, onClose }: QuestionModalProps) {
	const [answer, setAnswer] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const respondToQuestion = useAtomSet(respondToQuestionMutation, { mode: "promiseExit" })

	const handleSubmit = async () => {
		if (!answer.trim()) return

		setIsSubmitting(true)
		try {
			await exitToastAsync(
				respondToQuestion({
					payload: {
						sessionId,
						questionId: request.id,
						answer: answer.trim(),
					},
				}),
			)
				.loading("Sending answer...")
				.successMessage("Answer submitted")
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
					description: err.message || "Could not process the answer.",
					isRetryable: true,
				}))
				.run()

			onClose()
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleOptionSelect = async (option: string) => {
		setIsSubmitting(true)
		try {
			await exitToastAsync(
				respondToQuestion({
					payload: {
						sessionId,
						questionId: request.id,
						answer: option,
					},
				}),
			)
				.loading("Sending answer...")
				.successMessage("Answer submitted")
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
					description: err.message || "Could not process the answer.",
					isRetryable: true,
				}))
				.run()

			onClose()
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<ModalContent isOpen={isOpen} onOpenChange={() => {}} isDismissable={false}>
			<ModalHeader>
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-full bg-info/20">
						<IconChatBubble className="size-5 fill-info" />
					</div>
					<div>
						<ModalTitle>Question from Agent</ModalTitle>
						<ModalDescription>The agent needs your input to continue.</ModalDescription>
					</div>
				</div>
			</ModalHeader>

			<ModalBody className="space-y-4">
				<div className="rounded-lg border border-border bg-secondary/50 p-4">
					<p className="text-sm">{request.description}</p>
				</div>

				{request.options && request.options.length > 0 ? (
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-fg">Choose an option:</p>
						<div className="space-y-2">
							{request.options.map((option, index) => (
								<button
									key={index}
									type="button"
									disabled={isSubmitting}
									onClick={() => handleOptionSelect(option)}
									className="w-full rounded-lg border border-border p-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-secondary disabled:opacity-50"
								>
									{option}
								</button>
							))}
						</div>
					</div>
				) : (
					<TextField>
						<Label>Your answer</Label>
						<Input
							placeholder="Type your answer..."
							value={answer}
							onChange={(e) => setAnswer(e.target.value)}
						/>
					</TextField>
				)}
			</ModalBody>

			{(!request.options || request.options.length === 0) && (
				<ModalFooter>
					<Button
						intent="primary"
						onPress={handleSubmit}
						isDisabled={!answer.trim() || isSubmitting}
					>
						<IconSend className="size-4" />
						Submit Answer
					</Button>
				</ModalFooter>
			)}
		</ModalContent>
	)
}
