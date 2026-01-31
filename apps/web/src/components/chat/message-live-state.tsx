import type { MessageId } from "@hazel/schema"
import { useMessageActor } from "~/hooks/use-message-actor"
import { cn } from "~/lib/utils"
import { AgentStepsView } from "./agent-steps-view"

interface MessageLiveStateProps {
	messageId: MessageId
	enabled: boolean
}

/**
 * Renders the live state UI for a message with an attached actor.
 * Shows progress bar, streaming text, AI agent steps, and error states.
 */
export function MessageLiveState({ messageId, enabled }: MessageLiveStateProps) {
	const state = useMessageActor(messageId, enabled)

	if (!enabled || state.status === "idle") {
		return null
	}

	return (
		<div className="mt-2 space-y-2">
			{/* Progress bar */}
			{state.status === "active" && state.progress !== null && (
				<div className="w-full max-w-xs">
					<ProgressBar value={state.progress} />
				</div>
			)}

			{/* Streaming text indicator */}
			{state.isStreaming && (
				<div className="flex items-center gap-2 text-muted-fg text-sm">
					<StreamingIndicator />
					<span>Generating...</span>
				</div>
			)}

			{/* AI Agent Steps */}
			{state.steps.length > 0 && (
				<AgentStepsView steps={state.steps} currentIndex={state.currentStepIndex} />
			)}

			{/* Error state */}
			{state.status === "failed" && state.error !== null && <ErrorBadge error={state.error} />}

			{/* Custom data display */}
			{typeof state.data.deploymentUrl === "string" && (
				<a
					href={state.data.deploymentUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
				>
					View Deployment
					<ExternalLinkIcon className="size-3" />
				</a>
			)}
		</div>
	)
}

function ProgressBar({ value }: { value: number }) {
	return (
		<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
			<div
				className={cn(
					"h-full rounded-full bg-primary transition-all duration-300",
					value === 100 && "bg-success",
				)}
				style={{ width: `${value}%` }}
			/>
		</div>
	)
}

function StreamingIndicator() {
	return (
		<span className="flex gap-0.5">
			<span
				className="size-1 animate-bounce rounded-full bg-primary"
				style={{ animationDelay: "0ms" }}
			/>
			<span
				className="size-1 animate-bounce rounded-full bg-primary"
				style={{ animationDelay: "150ms" }}
			/>
			<span
				className="size-1 animate-bounce rounded-full bg-primary"
				style={{ animationDelay: "300ms" }}
			/>
		</span>
	)
}

function ErrorBadge({ error }: { error: string }) {
	return (
		<div className="inline-flex items-center gap-1.5 rounded bg-danger/10 px-2 py-1 text-danger text-sm">
			<svg
				className="size-4"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" x2="12" y1="8" y2="12" />
				<line x1="12" x2="12.01" y1="16" y2="16" />
			</svg>
			<span>{error}</span>
		</div>
	)
}

function ExternalLinkIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
			<polyline points="15 3 21 3 21 9" />
			<line x1="10" x2="21" y1="14" y2="3" />
		</svg>
	)
}
