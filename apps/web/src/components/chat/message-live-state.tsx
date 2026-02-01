import type { MessageId } from "@hazel/schema"
import { useMessageActor, type CachedActorState } from "~/hooks/use-message-actor"
import { cn } from "~/lib/utils"
import { AgentStepsView } from "./agent-steps-view"
import { MessageLiveContext, useMessageLive } from "./message-live-context"
import { SlateMessageViewer } from "./slate-editor/slate-message-viewer"
import { StreamingMarkdown } from "./streaming-markdown"

// ============================================================================
// Provider
// ============================================================================

interface MessageLiveProviderProps {
	messageId: MessageId
	enabled: boolean
	/** Cached state from the database - if completed/failed, renders without actor connection */
	cached?: CachedActorState
	children: React.ReactNode
}

/**
 * Provides message actor state to child components via context.
 * Returns null if disabled or status is idle.
 */
function MessageLiveProvider({ messageId, enabled, cached, children }: MessageLiveProviderProps) {
	const actorState = useMessageActor(messageId, { enabled, cached })

	// Don't render children if disabled or idle
	if (!enabled || actorState.status === "idle") {
		return null
	}

	return <MessageLiveContext value={{ state: actorState }}>{children}</MessageLiveContext>
}

// ============================================================================
// Sub-Components
// ============================================================================

interface MessageLiveRootProps {
	children: React.ReactNode
	className?: string
}

function MessageLiveRoot({ children, className }: MessageLiveRootProps) {
	return <div className={cn("mt-2 space-y-2", className)}>{children}</div>
}

function MessageLiveProgress() {
	const { state } = useMessageLive()
	if (state.status !== "active" || state.progress === null) return null

	return (
		<div className="w-full max-w-xs">
			<ProgressBar value={state.progress} />
		</div>
	)
}

function MessageLiveSteps() {
	const { state } = useMessageLive()
	if (state.steps.length === 0) return null

	return <AgentStepsView steps={state.steps} currentIndex={state.currentStepIndex} />
}

function MessageLiveText() {
	const { state } = useMessageLive()
	if (!state.text) return null

	return state.isStreaming ? (
		<StreamingMarkdown isAnimating>{state.text}</StreamingMarkdown>
	) : (
		<SlateMessageViewer content={state.text} />
	)
}

function MessageLiveError() {
	const { state } = useMessageLive()
	if (state.status !== "failed" || !state.error) return null

	return <ErrorBadge error={state.error} />
}

interface MessageLiveDataProps<T> {
	dataKey: string
	children: (value: T) => React.ReactNode
}

function MessageLiveData<T>({ dataKey, children }: MessageLiveDataProps<T>) {
	const { state } = useMessageLive()
	const value = state.data[dataKey] as T | undefined
	if (value === undefined) return null

	return <>{children(value)}</>
}

// ============================================================================
// Compound Component Export
// ============================================================================

export const MessageLive = {
	Provider: MessageLiveProvider,
	Root: MessageLiveRoot,
	Progress: MessageLiveProgress,
	Steps: MessageLiveSteps,
	Text: MessageLiveText,
	Error: MessageLiveError,
	Data: MessageLiveData,
}

// ============================================================================
// Backwards Compatible Legacy Component
// ============================================================================

interface MessageLiveStateProps {
	messageId: MessageId
	enabled: boolean
	/** Cached state from the database - if completed/failed, renders without actor connection */
	cached?: CachedActorState
}

/**
 * Renders the live state UI for a message with an attached actor.
 * Shows progress bar, streaming text, AI agent steps, and error states.
 *
 * If cached state is provided and status is "completed" or "failed",
 * renders directly from cache without connecting to the Rivet actor.
 *
 * @deprecated Use MessageLive compound component for more flexibility
 */
export function MessageLiveState({ messageId, enabled, cached }: MessageLiveStateProps) {
	return (
		<MessageLive.Provider messageId={messageId} enabled={enabled} cached={cached}>
			<MessageLive.Root>
				<MessageLive.Progress />
				<MessageLive.Steps />
				<MessageLive.Text />
				<MessageLive.Error />
				<MessageLive.Data<string> dataKey="deploymentUrl">
					{(url) => (
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
						>
							View Deployment
							<ExternalLinkIcon className="size-3" />
						</a>
					)}
				</MessageLive.Data>
			</MessageLive.Root>
		</MessageLive.Provider>
	)
}

// ============================================================================
// Internal Components
// ============================================================================

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
