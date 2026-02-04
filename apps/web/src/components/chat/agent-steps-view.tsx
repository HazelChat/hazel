import { createContext, memo, use, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button, Disclosure, DisclosurePanel, Heading } from "react-aria-components"
import type { IntegrationConnection } from "@hazel/domain/models"
import IconBrainSparkle from "~/components/icons/icon-brain-sparkle"
import { ShinyText } from "~/components/ui/shiny-text"
import IconCheck from "~/components/icons/icon-check"
import { IconChevronDown } from "~/components/icons/icon-chevron-down"
import { IconChevronUp } from "~/components/icons/icon-chevron-up"
import IconLoader from "~/components/icons/icon-loader"
import IconSquareTerminal from "~/components/icons/icon-square-terminal"
import IconXmark from "~/components/icons/icon-xmark"
import { getIntegrationIconUrl, INTEGRATION_PROVIDERS } from "~/lib/bot-scopes"
import { cn } from "~/lib/utils"

type IntegrationProvider = IntegrationConnection.IntegrationProvider

// ============================================================================
// Helpers
// ============================================================================

/**
 * Formats a duration in milliseconds to a human-readable string,
 * rounded to the most significant unit.
 */
function formatDuration(ms: number): string {
	if (ms < 3000) {
		return `${Math.round(ms)}ms`
	}
	const seconds = Math.round(ms / 1000)
	if (seconds < 60) {
		return `${seconds}s`
	}
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = seconds % 60
	if (remainingSeconds === 0) {
		return `${minutes}m`
	}
	return `${minutes}m ${remainingSeconds}s`
}

function getToolIntegrationProvider(toolName: string | undefined): IntegrationProvider | null {
	if (!toolName) return null
	const prefix = toolName.split("_")[0]
	if (prefix && prefix in INTEGRATION_PROVIDERS) {
		return prefix as IntegrationProvider
	}
	return null
}

// ============================================================================
// Collapsible Content
// ============================================================================

/** Maximum number of lines to show before collapsing */
const COLLAPSE_THRESHOLD = 15

interface CollapsibleContentProps {
	children: React.ReactNode
	/** Content string used for line counting */
	content: string
}

/**
 * Wrapper component that adds show more/less behavior for tall content.
 * Uses the same pattern as code-block-element.tsx.
 */
function CollapsibleContent({ children, content }: CollapsibleContentProps) {
	const [expanded, setExpanded] = useState(false)

	const lineCount = content.split("\n").length
	const isCollapsible = lineCount > COLLAPSE_THRESHOLD

	if (!isCollapsible) {
		return <>{children}</>
	}

	return (
		<div className="relative">
			<div className={cn(isCollapsible && !expanded && "max-h-80 overflow-hidden")}>{children}</div>
			<div
				className={cn(
					"flex items-end justify-center pb-2",
					!expanded &&
						"-mx-3 -mb-3 absolute right-0 bottom-0 left-0 bg-gradient-to-t from-muted via-muted/80 to-transparent pt-12",
				)}
			>
				<button
					type="button"
					onClick={() => setExpanded(!expanded)}
					className="flex cursor-pointer items-center gap-1 rounded-md bg-accent-9/20 px-3 py-1.5 font-medium text-xs transition-colors hover:bg-accent-9/30"
				>
					{expanded ? (
						<>
							<IconChevronUp className="size-3.5" />
							Show less
						</>
					) : (
						<>
							<IconChevronDown className="size-3.5" />
							Show more ({lineCount} lines)
						</>
					)}
				</button>
			</div>
		</div>
	)
}

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a step in an AI agent workflow.
 */
export interface AgentStep {
	id: string
	type: "thinking" | "tool_call" | "tool_result" | "text" | "error"
	status: "pending" | "active" | "completed" | "failed"
	content?: string
	toolName?: string
	toolInput?: Record<string, unknown>
	toolOutput?: unknown
	toolError?: string
	startedAt?: number
	completedAt?: number
}

// ============================================================================
// Context
// ============================================================================

interface AgentStepsContextValue {
	globalFailed: boolean
	currentIndex: number | null
}

const AgentStepsContext = createContext<AgentStepsContextValue | null>(null)

function useAgentStepsContext(): AgentStepsContextValue {
	const ctx = use(AgentStepsContext)
	if (!ctx) {
		throw new Error("AgentSteps components must be used within AgentSteps.Root")
	}
	return ctx
}

// ============================================================================
// Root Component
// ============================================================================

interface AgentStepsRootProps {
	steps: AgentStep[]
	currentIndex: number | null
	/** Global status - used to auto-collapse thinking when the operation fails */
	status?: "idle" | "active" | "completed" | "failed"
	children?: React.ReactNode | ((step: AgentStep, index: number) => React.ReactNode)
	className?: string
}

type GroupedStep =
	| { type: "single"; step: AgentStep; index: number }
	| {
			type: "step_group"
			thinking?: AgentStep
			thinkingIndex?: number
			toolCalls: AgentStep[]
			startIndex: number
	  }

/**
 * Root component for the AgentSteps compound component.
 * Provides context and renders steps with animation.
 * Groups consecutive tool calls into compact chip layout.
 */
function AgentStepsRoot({ steps, currentIndex, status, children, className }: AgentStepsRootProps) {
	const contextValue = useMemo(
		(): AgentStepsContextValue => ({
			globalFailed: status === "failed",
			currentIndex,
		}),
		[status, currentIndex],
	)

	// Group thinking steps with their following tool calls
	const groupedSteps = useMemo(() => {
		const groups: GroupedStep[] = []
		let pendingThinking: AgentStep | null = null
		let pendingThinkingIndex: number | null = null
		let currentToolGroup: AgentStep[] = []
		let toolGroupStartIndex = 0

		const flushToolGroup = () => {
			if (currentToolGroup.length > 0 || pendingThinking) {
				groups.push({
					type: "step_group",
					thinking: pendingThinking ?? undefined,
					thinkingIndex: pendingThinkingIndex ?? undefined,
					toolCalls: currentToolGroup,
					startIndex: pendingThinking ? pendingThinkingIndex! : toolGroupStartIndex,
				})
				pendingThinking = null
				pendingThinkingIndex = null
				currentToolGroup = []
			}
		}

		for (let i = 0; i < steps.length; i++) {
			const step = steps[i]!

			if (step.type === "thinking") {
				// Flush any existing group before starting a new thinking
				flushToolGroup()
				pendingThinking = step
				pendingThinkingIndex = i
			} else if (step.type === "tool_call") {
				if (currentToolGroup.length === 0) {
					toolGroupStartIndex = i
				}
				currentToolGroup.push(step)
			} else {
				// Non-thinking, non-tool_call step (text, error, etc.)
				flushToolGroup()
				groups.push({ type: "single", step, index: i })
			}
		}

		// Flush any remaining group
		flushToolGroup()

		return groups
	}, [steps])

	if (steps.length === 0) return null

	// If custom children renderer is provided, use legacy behavior
	if (typeof children === "function") {
		return (
			<AgentStepsContext value={contextValue}>
				<div
					className={cn("mt-2 space-y-2", className)}
					role="list"
					aria-label="AI agent workflow steps"
				>
					<AnimatePresence mode="popLayout">
						{steps.map((step, index) => (
							<motion.div
								key={step.id}
								initial={{ opacity: 0, x: -8 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -8 }}
								transition={{
									duration: 0.2,
									delay: index * 0.05,
									ease: [0.215, 0.61, 0.355, 1],
								}}
							>
								{children(step, index)}
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</AgentStepsContext>
		)
	}

	return (
		<AgentStepsContext value={contextValue}>
			<div className={cn("mt-2 space-y-1", className)} role="list" aria-label="AI agent workflow steps">
				<AnimatePresence mode="popLayout">
					{groupedSteps.map((group, groupIndex) => {
						if (group.type === "step_group") {
							const thinkingId = group.thinking?.id ?? ""
							const toolIds = group.toolCalls.map((s) => s.id).join("-")
							const groupKey = `${thinkingId}-${toolIds}`
							return (
								<motion.div
									key={groupKey}
									initial={{ opacity: 0, x: -8 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -8 }}
									transition={{
										duration: 0.2,
										delay: groupIndex * 0.05,
										ease: [0.215, 0.61, 0.355, 1],
									}}
								>
									<StepGroup
										group={group}
										currentIndex={currentIndex}
										globalFailed={contextValue.globalFailed}
									/>
								</motion.div>
							)
						}
						return (
							<motion.div
								key={group.step.id}
								initial={{ opacity: 0, x: -8 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -8 }}
								transition={{
									duration: 0.2,
									delay: groupIndex * 0.05,
									ease: [0.215, 0.61, 0.355, 1],
								}}
							>
								<AgentStepItem step={group.step} index={group.index} />
							</motion.div>
						)
					})}
				</AnimatePresence>
			</div>
		</AgentStepsContext>
	)
}

// ============================================================================
// Step Item (Default Renderer)
// ============================================================================

interface AgentStepItemProps {
	step: AgentStep
	index: number
}

/**
 * Default step item that automatically renders the appropriate step type.
 * Can be used directly or as a building block for custom renderers.
 */
const AgentStepItem = memo(function AgentStepItem({ step, index }: AgentStepItemProps) {
	const { currentIndex } = useAgentStepsContext()
	const isActive = index === currentIndex

	return (
		<div className={cn("text-sm", isActive && "animate-pulse")} role="listitem">
			{step.type === "tool_call" && <ToolCallStep step={step} isActive={isActive} />}
			{step.type === "text" && <TextStep step={step} />}
			{step.type === "error" && <ErrorStep step={step} />}
		</div>
	)
})

// ============================================================================
// Step Type Components
// ============================================================================

// ============================================================================
// Thinking Components (Inline Chip + Expandable Detail)
// ============================================================================

interface ThinkingChipProps {
	step: AgentStep
	isExpanded: boolean
	isActive?: boolean
	globalFailed?: boolean
	/** When true, renders with tool-chip-like styling (bordered pill) */
	standalone?: boolean
	onToggle: () => void
}

/**
 * Compact inline indicator for thinking steps.
 * Shows animated indicator when active, duration when complete.
 * When standalone (no tool calls following), renders with tool-chip-like styling.
 */
function ThinkingChip({
	step,
	isExpanded,
	isActive = false,
	globalFailed = false,
	standalone = false,
	onToggle,
}: ThinkingChipProps) {
	const durationMs = useMemo(() => {
		if (!step.startedAt) return null
		const endTime = step.completedAt ?? Date.now()
		return endTime - step.startedAt
	}, [step.startedAt, step.completedAt])

	const isThinking = step.status === "active" && isActive && !globalFailed

	// Standalone: show "Thought for Xs", Inline: show just "Xs"
	const completedText = standalone
		? `Thought for ${formatDuration(durationMs ?? 0)}`
		: formatDuration(durationMs ?? 0)

	return (
		<button
			type="button"
			onClick={onToggle}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full text-xs transition-colors",
				standalone
					? // Standalone: match tool chip style (bordered pill)
						cn(
							"border px-2.5 py-1 font-medium",
							isExpanded
								? "border-accent/50 bg-accent/10 text-accent-fg hover:bg-accent/20"
								: "border-muted bg-muted/50 text-muted-fg hover:bg-muted/70",
						)
					: // Inline: minimal style
						cn(
							"px-2 py-0.5",
							isExpanded ? "bg-muted text-muted-fg" : "text-muted-fg/80 hover:text-muted-fg",
						),
			)}
		>
			<IconBrainSparkle
				className={cn(
					standalone ? "size-3.5" : "size-3",
					isThinking ? "animate-[icon-throb_1.5s_ease-in-out_infinite]" : "opacity-60",
				)}
				aria-hidden
			/>
			{isThinking ? (
				<ShinyText text="Thinking..." speed={1.5} color="var(--muted-fg)" shineColor="var(--fg)" />
			) : (
				<span>{step.status === "failed" ? "Stopped" : completedText}</span>
			)}
		</button>
	)
}

interface ThinkingDetailProps {
	step: AgentStep
}

/**
 * Expandable detail panel for thinking content.
 */
function ThinkingDetail({ step }: ThinkingDetailProps) {
	const content = step.content || "Processing..."

	return (
		<motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			transition={{ duration: 0.15 }}
			className="overflow-hidden"
		>
			<div className="rounded-lg border border-muted bg-muted/30 p-3 text-sm text-muted-fg">
				<CollapsibleContent content={content}>{content}</CollapsibleContent>
			</div>
		</motion.div>
	)
}

interface ToolIconProps {
	toolName: string | undefined
	className?: string
}

function ToolIcon({ toolName, className = "size-4 shrink-0" }: ToolIconProps) {
	const [imgError, setImgError] = useState(false)
	const provider = getToolIntegrationProvider(toolName)

	if (!provider || imgError) {
		return <IconSquareTerminal className={className} aria-hidden />
	}

	return (
		<img
			src={getIntegrationIconUrl(provider, 32)}
			alt=""
			className={cn(className, "rounded-sm")}
			aria-hidden
			onError={() => setImgError(true)}
		/>
	)
}

interface ToolCallStepProps {
	step: AgentStep
	isActive?: boolean
}

function getToolDisplayName(toolName: string | undefined): string {
	if (!toolName) return ""
	const provider = getToolIntegrationProvider(toolName)
	if (provider) {
		// Strip the provider prefix (e.g., "linear_create_issue" -> "create_issue")
		return toolName.slice(provider.length + 1)
	}
	return toolName
}

function ToolCallStep({ step, isActive = false }: ToolCallStepProps) {
	const [isExpanded, setIsExpanded] = useState(false)

	return (
		<Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
			<Heading>
				<Button
					slot="trigger"
					className="flex w-full items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-muted-fg text-sm transition-colors hover:bg-muted/70"
				>
					<ToolIcon toolName={step.toolName} />
					<span className="flex-1 text-left font-mono">{getToolDisplayName(step.toolName)}</span>
					{step.status === "active" && isActive && (
						<IconLoader className="size-4 animate-spin" aria-label="In progress" />
					)}
					{step.status === "completed" && (
						<IconCheck className="size-4 text-success" aria-label="Completed" />
					)}
					{step.status === "failed" && (
						<IconXmark className="size-4 text-danger" aria-label="Failed" />
					)}
					<IconChevronUp
						className={cn("size-4 transition-transform", !isExpanded && "rotate-180")}
						aria-hidden
					/>
				</Button>
			</Heading>
			<DisclosurePanel className="ml-2 mt-1 py-2 pl-3 text-sm">
				{step.toolInput && Object.keys(step.toolInput).length > 0 && (
					<pre className="overflow-x-auto font-mono text-xs text-muted-fg">
						{JSON.stringify(step.toolInput, null, 2)}
					</pre>
				)}
				{step.toolOutput !== undefined && (
					<pre className="mt-1 overflow-x-auto font-mono text-xs text-success">
						{typeof step.toolOutput === "string"
							? step.toolOutput
							: JSON.stringify(step.toolOutput, null, 2)}
					</pre>
				)}
				{step.toolError && <div className="mt-1 text-xs text-danger">{step.toolError}</div>}
			</DisclosurePanel>
		</Disclosure>
	)
}

// ============================================================================
// Compact Tool Call Components
// ============================================================================

interface ToolCallChipProps {
	step: AgentStep
	isExpanded: boolean
	isActive?: boolean
	onToggle: () => void
}

/**
 * Compact inline pill component for tool calls.
 * Shows icon + short name + status indicator.
 */
function ToolCallChip({ step, isExpanded, isActive = false, onToggle }: ToolCallChipProps) {
	const isRunning = step.status === "active" && isActive

	return (
		<button
			type="button"
			onClick={onToggle}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
				"border",
				isExpanded
					? "border-accent/50 bg-accent/10 text-accent-fg hover:bg-accent/20"
					: "border-muted bg-muted/50 text-muted-fg hover:bg-muted/70",
			)}
		>
			<ToolIcon toolName={step.toolName} className="size-3.5" />
			{isRunning ? (
				<ShinyText
					text={getToolDisplayName(step.toolName)}
					speed={1.5}
					color="var(--muted-fg)"
					shineColor="var(--fg)"
					className="font-mono"
				/>
			) : (
				<span className="font-mono">{getToolDisplayName(step.toolName)}</span>
			)}
			{isRunning && <IconLoader className="size-3 animate-spin" aria-label="In progress" />}
			{step.status === "completed" && (
				<IconCheck className="size-3 text-success" aria-label="Completed" />
			)}
			{step.status === "failed" && <IconXmark className="size-3 text-danger" aria-label="Failed" />}
		</button>
	)
}

interface ToolCallDetailProps {
	step: AgentStep
}

/**
 * Detail panel shown below chips when one is selected.
 */
function ToolCallDetail({ step }: ToolCallDetailProps) {
	// Compute full content for line counting
	const inputText = step.toolInput ? JSON.stringify(step.toolInput, null, 2) : ""
	const outputText =
		step.toolOutput !== undefined
			? typeof step.toolOutput === "string"
				? step.toolOutput
				: JSON.stringify(step.toolOutput, null, 2)
			: ""
	const fullContent = [inputText, outputText, step.toolError].filter(Boolean).join("\n")

	return (
		<motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			transition={{ duration: 0.15 }}
			className="overflow-hidden"
		>
			<div className="rounded-lg border border-muted bg-muted/30 p-3 text-sm">
				<CollapsibleContent content={fullContent}>
					{step.toolInput && Object.keys(step.toolInput).length > 0 && (
						<div>
							<div className="mb-1 text-xs font-medium text-muted-fg">Input</div>
							<pre className="overflow-x-auto font-mono text-xs text-fg">
								{JSON.stringify(step.toolInput, null, 2)}
							</pre>
						</div>
					)}
					{step.toolOutput !== undefined && (
						<div
							className={step.toolInput && Object.keys(step.toolInput).length > 0 ? "mt-2" : ""}
						>
							<div className="mb-1 text-xs font-medium text-muted-fg">Output</div>
							<pre className="overflow-x-auto font-mono text-xs text-success">
								{typeof step.toolOutput === "string"
									? step.toolOutput
									: JSON.stringify(step.toolOutput, null, 2)}
							</pre>
						</div>
					)}
					{step.toolError && (
						<div className={step.toolInput || step.toolOutput !== undefined ? "mt-2" : ""}>
							<div className="mb-1 text-xs font-medium text-danger">Error</div>
							<div className="text-xs text-danger">{step.toolError}</div>
						</div>
					)}
				</CollapsibleContent>
			</div>
		</motion.div>
	)
}

// ============================================================================
// Step Group Component (Thinking + Tool Calls)
// ============================================================================

interface StepGroupProps {
	group: {
		thinking?: AgentStep
		thinkingIndex?: number
		toolCalls: AgentStep[]
		startIndex: number
	}
	currentIndex: number | null
	globalFailed: boolean
}

/**
 * Renders a thinking indicator inline with tool chips.
 * Tracks which item is expanded (thinking OR a tool), shows detail panel below.
 */
function StepGroup({ group, currentIndex, globalFailed }: StepGroupProps) {
	const [expandedId, setExpandedId] = useState<string | null>(null)
	const prevStatusRef = useRef(group.thinking?.status)

	// Auto-collapse thinking only when status TRANSITIONS to completed/failed
	useEffect(() => {
		if (group.thinking && expandedId === group.thinking.id) {
			const prevStatus = prevStatusRef.current
			const newStatus = group.thinking.status
			// Only collapse if status just changed to completed/failed (or global failed)
			if (prevStatus === "active" && (newStatus === "completed" || newStatus === "failed")) {
				setExpandedId(null)
			}
			if (globalFailed && prevStatus !== "failed") {
				setExpandedId(null)
			}
		}
		prevStatusRef.current = group.thinking?.status
	}, [group.thinking?.status, globalFailed, group.thinking?.id, expandedId])

	const expandedThinking = group.thinking && expandedId === group.thinking.id
	const expandedTool = group.toolCalls.find((t) => t.id === expandedId)

	// Calculate tool call start index (after thinking if present)
	const toolStartIndex = group.thinking ? group.startIndex + 1 : group.startIndex

	return (
		<div className="space-y-1.5">
			{/* Main row: thinking indicator + tool chips */}
			<div className="flex flex-wrap items-center gap-1.5">
				{group.thinking && (
					<ThinkingChip
						step={group.thinking}
						isExpanded={!!expandedThinking}
						isActive={group.thinkingIndex === currentIndex}
						globalFailed={globalFailed}
						standalone={group.toolCalls.length === 0}
						onToggle={() => setExpandedId(expandedThinking ? null : group.thinking!.id)}
					/>
				)}
				{group.toolCalls.map((step, idx) => (
					<ToolCallChip
						key={step.id}
						step={step}
						isExpanded={expandedId === step.id}
						isActive={toolStartIndex + idx === currentIndex}
						onToggle={() => setExpandedId(expandedId === step.id ? null : step.id)}
					/>
				))}
			</div>
			{/* Expand panel below */}
			<AnimatePresence mode="wait">
				{expandedThinking && group.thinking && (
					<ThinkingDetail key={group.thinking.id} step={group.thinking} />
				)}
				{expandedTool && <ToolCallDetail key={expandedTool.id} step={expandedTool} />}
			</AnimatePresence>
		</div>
	)
}

interface TextStepProps {
	step: AgentStep
}

function TextStep({ step }: TextStepProps) {
	return <div className="text-fg">{step.content}</div>
}

interface ErrorStepProps {
	step: AgentStep
}

function ErrorStep({ step }: ErrorStepProps) {
	return (
		<div className="flex items-center gap-2 text-danger" role="alert">
			<IconXmark className="size-4 shrink-0" aria-hidden />
			<span>{step.content || step.toolError || "An error occurred"}</span>
		</div>
	)
}

// ============================================================================
// Compound Component Export
// ============================================================================

/**
 * Compound component for rendering AI agent workflow steps.
 *
 * @example Default usage (backwards compatible)
 * ```tsx
 * <AgentSteps.Root steps={steps} currentIndex={currentIndex} status={status} />
 * ```
 *
 * @example Custom step rendering
 * ```tsx
 * <AgentSteps.Root steps={steps} currentIndex={currentIndex} status={status}>
 *   {(step, index) => (
 *     step.type === "tool_call"
 *       ? <CustomToolCallRenderer step={step} />
 *       : <AgentSteps.Step step={step} index={index} />
 *   )}
 * </AgentSteps.Root>
 * ```
 *
 * @example Individual components
 * ```tsx
 * <AgentSteps.ThinkingChip step={thinkingStep} isExpanded={false} onToggle={...} />
 * <AgentSteps.ToolCall step={toolCallStep} isActive={false} />
 * <AgentSteps.Text step={textStep} />
 * <AgentSteps.Error step={errorStep} />
 * ```
 */
export const AgentSteps = {
	Root: AgentStepsRoot,
	Step: AgentStepItem,
	ThinkingChip: ThinkingChip,
	ThinkingDetail: ThinkingDetail,
	ToolCall: ToolCallStep,
	ToolCallChip: ToolCallChip,
	ToolCallDetail: ToolCallDetail,
	Text: TextStep,
	Error: ErrorStep,
}
