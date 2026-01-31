import { IconTerminal } from "~/components/icons/icon-terminal"
import { IconCheck } from "~/components/icons/icon-check"
import type { ToolCallEvent as ToolCallEventType, ToolResultEvent } from "~/atoms/agent-session-atoms"

interface ToolCallEventProps {
	event: ToolCallEventType | ToolResultEvent
}

export function ToolCallEvent({ event }: ToolCallEventProps) {
	const isResult = event.type === "tool_result"

	return (
		<div className="rounded-lg border border-border bg-secondary/30 p-3">
			<div className="flex items-center gap-2">
				{isResult ? (
					<IconCheck className="size-4 fill-success" />
				) : (
					<IconTerminal className="size-4 fill-primary" />
				)}
				<span className="text-sm font-medium">
					{isResult ? "Tool Result" : "Tool Call"}: {event.data.toolName}
				</span>
			</div>
			{!isResult && event.data.args && (
				<pre className="mt-2 overflow-x-auto rounded bg-secondary p-2 text-xs">
					{JSON.stringify(event.data.args, null, 2)}
				</pre>
			)}
			{isResult && (
				<pre className="mt-2 overflow-x-auto rounded bg-secondary p-2 text-xs">
					{typeof event.data.result === "string"
						? event.data.result
						: JSON.stringify(event.data.result, null, 2)}
				</pre>
			)}
			<time className="mt-2 block text-xs text-muted-fg">{event.timestamp.toLocaleTimeString()}</time>
		</div>
	)
}
