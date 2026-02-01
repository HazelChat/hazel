import { createContext, memo, use, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button, Disclosure, DisclosurePanel, Heading } from "react-aria-components"
import IconBrainSparkle from "~/components/icons/icon-brain-sparkle"
import IconCheck from "~/components/icons/icon-check"
import { IconChevronUp } from "~/components/icons/icon-chevron-up"
import IconLoader from "~/components/icons/icon-loader"
import IconSquareTerminal from "~/components/icons/icon-square-terminal"
import IconXmark from "~/components/icons/icon-xmark"
import { cn } from "~/lib/utils"

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

/**
 * Root component for the AgentSteps compound component.
 * Provides context and renders steps with animation.
 */
function AgentStepsRoot({ steps, currentIndex, status, children, className }: AgentStepsRootProps) {
	const contextValue = useMemo(
		(): AgentStepsContextValue => ({
			globalFailed: status === "failed",
			currentIndex,
		}),
		[status, currentIndex],
	)

	if (steps.length === 0) return null

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
							{typeof children === "function" ? (
								children(step, index)
							) : (
								<AgentStepItem step={step} index={index} />
							)}
						</motion.div>
					))}
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
	// Calculate duration from startedAt/completedAt
	const duration = useMemo(() => {
		if (!step.startedAt) return null
		const endTime = step.completedAt ?? Date.now()
		return Math.round((endTime - step.startedAt) / 1000)
	}, [step.startedAt, step.completedAt])

	// Auto-expand while active, auto-collapse when completed or when global status becomes failed
	const [isExpanded, setIsExpanded] = useState(step.status === "active")

	useEffect(() => {
		if (step.status === "active") setIsExpanded(true)
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
								: `Thought for ${duration ?? 0} seconds`}
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

interface ToolCallStepProps {
	step: AgentStep
	isActive?: boolean
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
					<IconSquareTerminal className="size-4 shrink-0" aria-hidden />
					<span className="flex-1 text-left font-mono">{step.toolName}</span>
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
			<DisclosurePanel
				className={cn("ml-2 mt-1 py-2 pl-3 text-sm", isExpanded && "border-l-2 border-muted/50")}
			>
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
