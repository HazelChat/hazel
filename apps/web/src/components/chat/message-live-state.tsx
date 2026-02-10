import type { MessageId, OrganizationId } from "@hazel/schema"
import { useMemo } from "react"
import { IconBrainSparkle } from "~/components/icons/icon-brain-sparkle"
import { IconSparkles } from "~/components/icons/icon-sparkles"
import { IconWarning } from "~/components/icons/icon-warning"
import { useMessageActor, type CachedActorState } from "~/hooks/use-message-actor"
import { cn } from "~/lib/utils"
import { AgentSteps } from "./agent-steps-view"
import {
	MessageLiveContext,
	useMessageLiveMeta,
	useMessageLiveState,
	type MessageLiveActions,
	type MessageLiveMeta,
} from "./message-live-context"
import { SlateMessageViewer } from "./slate-editor/slate-message-viewer"
import { StreamingMarkdown } from "./streaming-markdown"

// ============================================================================
// Loading Configuration
// ============================================================================

interface LoadingConfig {
	text?: string
	icon?: "sparkle" | "brain"
	showSpinner?: boolean
	throbbing?: boolean
}

// ============================================================================
// Provider
// ============================================================================

interface MessageLiveProviderProps {
	messageId: MessageId
	enabled: boolean
	organizationId?: OrganizationId
	/** Cached state from the database - if completed/failed, renders without actor connection */
	cached?: CachedActorState
	/** Loading state configuration for the initial loading indicator */
	loading?: LoadingConfig
	children: React.ReactNode
}

// Stable empty objects for actions and meta (to prevent re-renders)
const emptyActions: MessageLiveActions = {}

/**
 * Provides message actor state to child components via context.
 * Returns null if disabled, shows loading state while waiting for actor to start.
 */
function MessageLiveProvider({
	messageId,
	enabled,
	organizationId,
	cached,
	loading,
	children,
}: MessageLiveProviderProps) {
	const actorState = useMessageActor(messageId, { enabled, cached })
	const meta = useMemo<MessageLiveMeta>(() => ({ organizationId }), [organizationId])

	const contextValue = useMemo(
		() => ({
			state: actorState,
			actions: emptyActions,
			meta,
		}),
		[actorState, meta],
	)

	// Don't render if disabled
	if (!enabled) {
		return null
	}

	// Show loading state while waiting for content
	// This handles the case where actor is already "active" but hasn't produced any output yet
	const isWaitingForContent =
		actorState.status === "idle" ||
		(actorState.status === "active" && !actorState.text && actorState.steps.length === 0)

	if (isWaitingForContent) {
		return <MessageLiveLoading config={loading} />
	}

	return <MessageLiveContext value={contextValue}>{children}</MessageLiveContext>
}

function MessageLiveLoading({ config }: { config?: LoadingConfig }) {
	const { text = "Thinking", icon = "sparkle" } = config ?? {}

	// Select icon component based on config
	const IconComponent = icon === "brain" ? IconBrainSparkle : IconSparkles

	return (
		<div className="flex items-center gap-2 text-muted-fg text-sm">
			<IconComponent className="size-4" aria-hidden />
			<span className="flex items-center gap-1">
				{text}
				<span className="inline-flex gap-0.5 ml-0.5">
					<span className="size-1 rounded-full bg-current animate-[ai-thinking-dot_1.4s_ease-in-out_infinite]" />
					<span
						className="size-1 rounded-full bg-current animate-[ai-thinking-dot_1.4s_ease-in-out_infinite]"
						style={{ animationDelay: "0.2s" }}
					/>
					<span
						className="size-1 rounded-full bg-current animate-[ai-thinking-dot_1.4s_ease-in-out_infinite]"
						style={{ animationDelay: "0.4s" }}
					/>
				</span>
			</span>
		</div>
	)
}

// ============================================================================
// Sub-Components
// ============================================================================

interface MessageLiveRootProps {
	children: React.ReactNode
	className?: string
}

function MessageLiveRoot({ children, className }: MessageLiveRootProps) {
	return <div className={cn("space-y-2", className)}>{children}</div>
}

function MessageLiveProgress() {
	const state = useMessageLiveState()
	if (state.status !== "active" || state.progress === null) return null

	return (
		<div className="w-full max-w-xs">
			<ProgressBar value={state.progress} />
		</div>
	)
}

function MessageLiveSteps() {
	const state = useMessageLiveState()
	if (state.steps.length === 0) return null

	return <AgentSteps.Root steps={state.steps} currentIndex={state.currentStepIndex} status={state.status} />
}

function MessageLiveText() {
	const state = useMessageLiveState()
	const meta = useMessageLiveMeta()
	if (!state.text) return null

	return state.isStreaming ? (
		<StreamingMarkdown isAnimating>{state.text}</StreamingMarkdown>
	) : (
		<SlateMessageViewer content={state.text} organizationId={meta.organizationId} />
	)
}

function MessageLiveError() {
	const state = useMessageLiveState()
	if (state.status !== "failed" || !state.error) return null

	return <ErrorCard error={state.error} />
}

interface MessageLiveDataProps<T> {
	dataKey: string
	children: (value: T) => React.ReactNode
}

function MessageLiveData<T>({ dataKey, children }: MessageLiveDataProps<T>) {
	const state = useMessageLiveState()
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
// Internal Components
// ============================================================================

function ProgressBar({ value }: { value: number }) {
	const isComplete = value === 100

	return (
		<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
			<div
				className={cn(
					"relative h-full rounded-full transition-all duration-500 ease-out",
					isComplete ? "bg-success" : "bg-primary",
				)}
				style={{ width: `${value}%` }}
			>
				{!isComplete && (
					<div className="absolute inset-0 overflow-hidden" aria-hidden="true">
						<div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[progress-shimmer_1.5s_ease-in-out_infinite]" />
					</div>
				)}
			</div>
		</div>
	)
}

function ErrorCard({ error }: { error: string }) {
	return (
		<div
			className="rounded-lg border border-danger/20 bg-danger/5 p-4 animate-[error-enter_0.3s_var(--ease-out-cubic)_forwards]"
			role="alert"
		>
			<div className="flex items-start gap-3">
				<div className="rounded-full bg-danger/10 p-2 animate-[error-icon-bounce_0.4s_var(--ease-out-cubic)_0.3s]">
					<IconWarning className="size-5 text-danger" aria-hidden />
				</div>
				<div className="flex-1 space-y-1">
					<p className="font-medium text-danger text-sm">Something went wrong</p>
					<p className="text-muted-fg text-sm">{error}</p>
				</div>
			</div>
		</div>
	)
}
