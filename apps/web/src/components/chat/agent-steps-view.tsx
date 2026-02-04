import { createContext, memo, use, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button, Disclosure, DisclosurePanel, Heading } from "react-aria-components"
import type { IntegrationConnection } from "@hazel/domain/models"
import IconBrainSparkle from "~/components/icons/icon-brain-sparkle"
import IconCheck from "~/components/icons/icon-check"
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

type GroupedStep = { type: "single"; step: AgentStep; index: number } | { type: "tool_group"; steps: AgentStep[]; startIndex: number }

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

	// Group consecutive tool calls
	const groupedSteps = useMemo(() => {
		const groups: GroupedStep[] = []
		let currentToolGroup: AgentStep[] = []
		let toolGroupStartIndex = 0

		for (let i = 0; i < steps.length; i++) {
			const step = steps[i]!
			if (step.type === "tool_call") {
				if (currentToolGroup.length === 0) {
					toolGroupStartIndex = i
				}
				currentToolGroup.push(step)
			} else {
				if (currentToolGroup.length > 0) {
					groups.push({ type: "tool_group", steps: currentToolGroup, startIndex: toolGroupStartIndex })
					currentToolGroup = []
				}
				groups.push({ type: "single", step, index: i })
			}
		}
		if (currentToolGroup.length > 0) {
			groups.push({ type: "tool_group", steps: currentToolGroup, startIndex: toolGroupStartIndex })
		}
		return groups
	}, [steps])

	if (steps.length === 0) return null

	// If custom children renderer is provided, use legacy behavior
	if (typeof children === "function") {
		return (
			<AgentStepsContext value={contextValue}>
				<div className={cn("mt-2 space-y-2", className)} role="list" aria-label="AI agent workflow steps">
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
						if (group.type === "tool_group") {
							const groupKey = group.steps.map((s) => s.id).join("-")
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
									<ToolCallGroup steps={group.steps} currentIndex={currentIndex} startIndex={group.startIndex} />
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
	const { currentIndex, globalFailed } = useAgentStepsContext()
	const isActive = index === currentIndex

	return (
		<div
			className={cn("text-sm", isActive && step.type !== "thinking" && "animate-pulse")}
			role="listitem"
		>
			{step.type === "thinking" && (
				<ThinkingStep step={step} isActive={isActive} globalFailed={globalFailed} />
			)}
			{step.type === "tool_call" && <ToolCallStep step={step} isActive={isActive} />}
			{step.type === "text" && <TextStep step={step} />}
			{step.type === "error" && <ErrorStep step={step} />}
		</div>
	)
})

// ============================================================================
// Step Type Components
// ============================================================================

interface ThinkingStepProps {
	step: AgentStep
	isActive?: boolean
	globalFailed?: boolean
}

function ThinkingStep({ step, isActive = false, globalFailed = false }: ThinkingStepProps) {
	// Calculate duration from startedAt/completedAt (in milliseconds)
	const durationMs = useMemo(() => {
		if (!step.startedAt) return null
		const endTime = step.completedAt ?? Date.now()
		return endTime - step.startedAt
	}, [step.startedAt, step.completedAt])

	// Default collapsed, auto-collapse when completed or when global status becomes failed
	const [isExpanded, setIsExpanded] = useState(false)

	useEffect(() => {
		if (step.status === "completed" || step.status === "failed" || globalFailed) setIsExpanded(false)
	}, [step.status, globalFailed])

	return (
		<Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
			<Heading>
				<Button
					slot="trigger"
					className="flex w-full items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-muted-fg text-sm transition-colors hover:bg-muted/70"
				>
					<IconBrainSparkle className="size-4 shrink-0" aria-hidden />
					<span className="flex-1 text-left">
						{step.status === "active"
							? "Thinking..."
							: step.status === "failed"
								? "Thinking stopped"
								: `Thought for ${formatDuration(durationMs ?? 0)}`}
					</span>
					{step.status === "active" && isActive && !globalFailed && (
						<IconLoader className="size-4 animate-spin" aria-label="In progress" />
					)}
					<IconChevronUp
						className={cn("size-4 transition-transform", !isExpanded && "rotate-180")}
						aria-hidden
					/>
				</Button>
			</Heading>
			<DisclosurePanel className="px-3 py-2 text-muted-fg text-sm">
				{step.content || "Processing..."}
			</DisclosurePanel>
		</Disclosure>
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
	return (
		<button
			type="button"
			onClick={onToggle}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
				"border",
				step.status === "failed"
					? "border-danger/30 bg-danger/10 text-danger hover:bg-danger/20"
					: isExpanded
						? "border-accent/50 bg-accent/10 text-accent-fg hover:bg-accent/20"
						: "border-muted bg-muted/50 text-muted-fg hover:bg-muted/70",
			)}
		>
			<ToolIcon toolName={step.toolName} className="size-3.5" />
			<span className="font-mono">{getToolDisplayName(step.toolName)}</span>
			{step.status === "active" && isActive && (
				<IconLoader className="size-3 animate-spin" aria-label="In progress" />
			)}
			{step.status === "completed" && (
				<IconCheck className="size-3 text-success" aria-label="Completed" />
			)}
			{step.status === "failed" && <IconXmark className="size-3" aria-label="Failed" />}
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
	return (
		<motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			transition={{ duration: 0.15 }}
			className="overflow-hidden"
		>
			<div className="rounded-lg border border-muted bg-muted/30 p-3 text-sm">
				{step.toolInput && Object.keys(step.toolInput).length > 0 && (
					<div>
						<div className="mb-1 text-xs font-medium text-muted-fg">Input</div>
						<pre className="overflow-x-auto font-mono text-xs text-fg">
							{JSON.stringify(step.toolInput, null, 2)}
						</pre>
					</div>
				)}
				{step.toolOutput !== undefined && (
					<div className={step.toolInput && Object.keys(step.toolInput).length > 0 ? "mt-2" : ""}>
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
			</div>
		</motion.div>
	)
}

interface ToolCallGroupProps {
	steps: AgentStep[]
	currentIndex: number | null
	startIndex: number
}

/**
 * Container for grouped tool calls with expand-below pattern.
 * Tracks which chip is expanded, shows detail panel below all chips.
 */
function ToolCallGroup({ steps, currentIndex, startIndex }: ToolCallGroupProps) {
	const [expandedId, setExpandedId] = useState<string | null>(null)
	const expandedStep = steps.find((s) => s.id === expandedId)

	return (
		<div className="space-y-1.5">
			{/* Chips row */}
			<div className="flex flex-wrap gap-1.5">
				{steps.map((step, idx) => (
					<ToolCallChip
						key={step.id}
						step={step}
						isExpanded={expandedId === step.id}
						isActive={startIndex + idx === currentIndex}
						onToggle={() => setExpandedId(expandedId === step.id ? null : step.id)}
					/>
				))}
			</div>
			{/* Detail panel below */}
			<AnimatePresence mode="wait">
				{expandedStep && <ToolCallDetail key={expandedStep.id} step={expandedStep} />}
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
 * @example Individual step components
 * ```tsx
 * <AgentSteps.Thinking step={thinkingStep} isActive={true} />
 * <AgentSteps.ToolCall step={toolCallStep} isActive={false} />
 * <AgentSteps.Text step={textStep} />
 * <AgentSteps.Error step={errorStep} />
 * ```
 */
export const AgentSteps = {
	Root: AgentStepsRoot,
	Step: AgentStepItem,
	Thinking: ThinkingStep,
	ToolCall: ToolCallStep,
	Text: TextStep,
	Error: ErrorStep,
}
