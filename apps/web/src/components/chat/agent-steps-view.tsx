import { memo } from "react"
import { cn } from "~/lib/utils"

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

interface AgentStepsViewProps {
	steps: AgentStep[]
	currentIndex: number | null
}

/**
 * Renders a visual representation of AI agent workflow steps.
 * Shows thinking, tool calls, and text generation steps with their status.
 */
export function AgentStepsView({ steps, currentIndex }: AgentStepsViewProps) {
	if (steps.length === 0) return null

	return (
		<div
			className="mt-2 space-y-2 border-border border-l-2 pl-3"
			role="list"
			aria-label="AI agent workflow steps"
		>
			{steps.map((step, index) => (
				<StepItem key={step.id} step={step} isActive={index === currentIndex} />
			))}
		</div>
	)
}

interface StepItemProps {
	step: AgentStep
	isActive: boolean
}

const StepItem = memo(function StepItem({ step, isActive }: StepItemProps) {
	return (
		<div className={cn("text-sm", isActive && "animate-pulse")} role="listitem">
			{step.type === "thinking" && <ThinkingStep step={step} isActive={isActive} />}
			{step.type === "tool_call" && <ToolCallStep step={step} isActive={isActive} />}
			{step.type === "text" && <TextStep step={step} />}
			{step.type === "error" && <ErrorStep step={step} />}
		</div>
	)
})

function ThinkingStep({ step, isActive }: { step: AgentStep; isActive: boolean }) {
	return (
		<div className="flex items-center gap-2 text-muted-fg">
			<BrainIcon className="size-4 shrink-0" aria-hidden />
			<span className="italic">{step.content || "Thinking..."}</span>
			{step.status === "active" && isActive && <Spinner aria-label="In progress" />}
			{step.status === "completed" && (
				<CheckIcon className="size-4 text-success" aria-label="Completed" />
			)}
		</div>
	)
}

function ToolCallStep({ step, isActive }: { step: AgentStep; isActive: boolean }) {
	return (
		<div className="rounded bg-muted/50 p-2">
			<div className="flex items-center gap-2 font-mono text-xs">
				<TerminalIcon className="size-4 shrink-0" aria-hidden />
				<span className="font-medium">{step.toolName}</span>
				{step.status === "active" && isActive && <Spinner aria-label="In progress" />}
				{step.status === "completed" && (
					<CheckIcon className="size-4 text-success" aria-label="Completed" />
				)}
				{step.status === "failed" && <XIcon className="size-4 text-danger" aria-label="Failed" />}
			</div>
			{step.toolInput && Object.keys(step.toolInput).length > 0 && (
				<pre className="mt-1 overflow-x-auto text-muted-fg text-xs">
					{JSON.stringify(step.toolInput, null, 2)}
				</pre>
			)}
			{step.toolOutput !== undefined && (
				<pre className="mt-1 overflow-x-auto text-success text-xs">
					{typeof step.toolOutput === "string"
						? step.toolOutput
						: JSON.stringify(step.toolOutput, null, 2)}
				</pre>
			)}
			{step.toolError && <div className="mt-1 text-danger text-xs">{step.toolError}</div>}
		</div>
	)
}

function TextStep({ step }: { step: AgentStep }) {
	return <div className="text-fg">{step.content}</div>
}

function ErrorStep({ step }: { step: AgentStep }) {
	return (
		<div className="flex items-center gap-2 text-danger" role="alert">
			<XIcon className="size-4 shrink-0" aria-hidden />
			<span>{step.content || step.toolError || "An error occurred"}</span>
		</div>
	)
}

// Simple icon components
interface IconProps {
	className?: string
	"aria-label"?: string
	"aria-hidden"?: boolean
}

function BrainIcon({ className, "aria-label": ariaLabel, "aria-hidden": ariaHidden }: IconProps) {
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
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
			role={ariaLabel ? "img" : undefined}
		>
			<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
			<path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
		</svg>
	)
}

function TerminalIcon({ className, "aria-label": ariaLabel, "aria-hidden": ariaHidden }: IconProps) {
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
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
			role={ariaLabel ? "img" : undefined}
		>
			<polyline points="4 17 10 11 4 5" />
			<line x1="12" x2="20" y1="19" y2="19" />
		</svg>
	)
}

function CheckIcon({ className, "aria-label": ariaLabel, "aria-hidden": ariaHidden }: IconProps) {
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
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
			role={ariaLabel ? "img" : undefined}
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	)
}

function XIcon({ className, "aria-label": ariaLabel, "aria-hidden": ariaHidden }: IconProps) {
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
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
			role={ariaLabel ? "img" : undefined}
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	)
}

function Spinner({ "aria-label": ariaLabel = "Loading" }: { "aria-label"?: string }) {
	return (
		<svg
			className="size-4 animate-spin text-muted-fg"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			aria-label={ariaLabel}
			role="img"
		>
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	)
}
