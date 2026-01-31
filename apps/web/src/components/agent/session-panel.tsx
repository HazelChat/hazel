import { useAtomValue, useAtomSet } from "@effect-atom/atom-react"
import { useState, useRef, useEffect } from "react"
import type { AgentSessionId } from "@hazel/schema"
import { Button } from "~/components/ui/button"
import { IconLoader } from "~/components/icons/icon-loader"
import { IconCirclePause } from "~/components/icons/icon-circle-pause"
import { IconSend } from "~/components/icons/icon-send"
import { IconTerminal } from "~/components/icons/icon-terminal"
import {
	AGENT_TYPE_INFO,
	endSessionMutation,
	pendingHitlRequestsAtomFamily,
	sendMessageMutation,
	SESSION_STATUS_INFO,
	sessionConnectionStatusAtomFamily,
	sessionEventsAtomFamily,
	type AgentEvent,
	type AgentSessionData,
} from "~/atoms/agent-session-atoms"
import { TextEvent } from "./events/text-event"
import { ToolCallEvent } from "./events/tool-call-event"
import { FileRefEvent } from "./events/file-ref-event"
import { ErrorEventDisplay } from "./events/error-event"
import { PermissionModal } from "./hitl/permission-modal"
import { QuestionModal } from "./hitl/question-modal"
import { exitToastAsync } from "~/lib/toast-exit"

interface SessionPanelProps {
	session: AgentSessionData
}

export function SessionPanel({ session }: SessionPanelProps) {
	const [message, setMessage] = useState("")
	const [isSending, setIsSending] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const events = useAtomValue(sessionEventsAtomFamily(session.id as AgentSessionId))
	const connectionStatus = useAtomValue(sessionConnectionStatusAtomFamily(session.id as AgentSessionId))
	const pendingRequests = useAtomValue(pendingHitlRequestsAtomFamily(session.id as AgentSessionId))

	const sendMessage = useAtomSet(sendMessageMutation, { mode: "promiseExit" })
	const endSession = useAtomSet(endSessionMutation, { mode: "promiseExit" })

	const agentInfo = AGENT_TYPE_INFO[session.agent as keyof typeof AGENT_TYPE_INFO]
	const statusInfo = SESSION_STATUS_INFO[session.status as keyof typeof SESSION_STATUS_INFO]

	// Auto-scroll to bottom when new events arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [events])

	const handleSendMessage = async () => {
		if (!message.trim() || isSending) return

		setIsSending(true)
		try {
			await exitToastAsync(
				sendMessage({
					payload: { sessionId: session.id as AgentSessionId, message: message.trim() },
				}),
			)
				.loading("Sending...")
				.onErrorTag("AgentSessionInvalidStateError", () => ({
					title: "Session not active",
					description: "The session is not in an active state.",
					isRetryable: false,
				}))
				.onErrorTag("AgentSessionNotFoundError", () => ({
					title: "Session not found",
					description: "This session may have ended.",
					isRetryable: false,
				}))
				.onErrorTag("SandboxAgentError", (err) => ({
					title: "Agent error",
					description: err.message || "The agent encountered an error.",
					isRetryable: true,
				}))
				.run()

			setMessage("")
		} finally {
			setIsSending(false)
		}
	}

	const handleEndSession = async () => {
		await exitToastAsync(endSession({ payload: { id: session.id as AgentSessionId } }))
			.loading("Ending session...")
			.successMessage("Session ended")
			.onErrorTag("AgentSessionNotFoundError", () => ({
				title: "Session not found",
				description: "This session may have already ended.",
				isRetryable: false,
			}))
			.onErrorTag("AgentSessionInvalidStateError", () => ({
				title: "Session already ended",
				description: "This session is no longer active.",
				isRetryable: false,
			}))
			.onErrorTag("SandboxAgentError", (err) => ({
				title: "Agent error",
				description: err.message || "Could not end session properly.",
				isRetryable: true,
			}))
			.run()
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	const renderEvent = (event: AgentEvent) => {
		switch (event.type) {
			case "text":
				return <TextEvent key={event.id} event={event as any} />
			case "tool_call":
			case "tool_result":
				return <ToolCallEvent key={event.id} event={event as any} />
			case "file_ref":
				return <FileRefEvent key={event.id} event={event as any} />
			case "error":
				return <ErrorEventDisplay key={event.id} event={event as any} />
			default:
				return null
		}
	}

	const isActive = session.status === "active" || session.status === "waiting_input"
	const showPermissionModal = pendingRequests.some((r) => r.type === "permission")
	const showQuestionModal = pendingRequests.some((r) => r.type === "question")
	const currentPermissionRequest = pendingRequests.find((r) => r.type === "permission")
	const currentQuestionRequest = pendingRequests.find((r) => r.type === "question")

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border px-4 py-3">
				<div className="flex items-center gap-3">
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
						<IconTerminal className="size-4 fill-primary" />
					</div>
					<div>
						<h2 className="text-sm font-medium">{agentInfo?.name || session.agent}</h2>
						<div className="flex items-center gap-2 text-xs text-muted-fg">
							<span
								className={`inline-block size-2 rounded-full ${
									statusInfo?.color === "green"
										? "bg-success"
										: statusInfo?.color === "yellow"
											? "bg-warning"
											: statusInfo?.color === "blue"
												? "bg-info"
												: "bg-muted-fg"
								}`}
							/>
							<span>{statusInfo?.label || session.status}</span>
							{connectionStatus === "connecting" && (
								<IconLoader className="size-3 animate-spin" />
							)}
						</div>
					</div>
				</div>

				{isActive && (
					<Button intent="danger" size="sm" onPress={handleEndSession}>
						<IconCirclePause className="size-4" />
						End Session
					</Button>
				)}
			</div>

			{/* Events stream */}
			<div className="flex-1 overflow-y-auto p-4">
				{events.length === 0 ? (
					<div className="flex h-full items-center justify-center text-muted-fg">
						<p>No events yet. Send a message to start.</p>
					</div>
				) : (
					<div className="space-y-3">
						{events.map(renderEvent)}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{/* Message input */}
			{isActive && (
				<div className="border-t border-border p-4">
					<div className="flex gap-2">
						<textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Type a message..."
							className="flex-1 resize-none rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-fg focus:border-primary focus:outline-none"
							rows={2}
							disabled={session.status === "waiting_input"}
						/>
						<Button
							intent="primary"
							size="sq-md"
							onPress={handleSendMessage}
							isDisabled={!message.trim() || isSending || session.status === "waiting_input"}
						>
							{isSending ? (
								<IconLoader className="size-4 animate-spin" />
							) : (
								<IconSend className="size-4" />
							)}
						</Button>
					</div>
					{session.status === "waiting_input" && (
						<p className="mt-2 text-xs text-warning">
							Waiting for your response to a permission or question request...
						</p>
					)}
				</div>
			)}

			{/* HITL Modals */}
			{showPermissionModal && currentPermissionRequest && (
				<PermissionModal
					sessionId={session.id as AgentSessionId}
					request={currentPermissionRequest}
					isOpen={showPermissionModal}
					onClose={() => {}}
				/>
			)}

			{showQuestionModal && currentQuestionRequest && (
				<QuestionModal
					sessionId={session.id as AgentSessionId}
					request={currentQuestionRequest}
					isOpen={showQuestionModal}
					onClose={() => {}}
				/>
			)}
		</div>
	)
}
