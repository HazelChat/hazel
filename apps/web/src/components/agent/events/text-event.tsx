import type { TextEvent as TextEventType } from "~/atoms/agent-session-atoms"

interface TextEventProps {
	event: TextEventType
}

export function TextEvent({ event }: TextEventProps) {
	return (
		<div className="rounded-lg bg-secondary/50 p-3">
			<p className="whitespace-pre-wrap text-sm">{event.data.content}</p>
			<time className="mt-1 block text-xs text-muted-fg">{event.timestamp.toLocaleTimeString()}</time>
		</div>
	)
}
