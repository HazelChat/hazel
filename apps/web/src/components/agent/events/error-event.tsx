import { IconAlertCircle } from "~/components/icons/icon-alert-circle"
import type { ErrorEvent } from "~/atoms/agent-session-atoms"

interface ErrorEventDisplayProps {
	event: ErrorEvent
}

export function ErrorEventDisplay({ event }: ErrorEventDisplayProps) {
	return (
		<div className="rounded-lg border border-danger/50 bg-danger/10 p-3">
			<div className="flex items-start gap-2">
				<IconAlertCircle className="size-4 mt-0.5 fill-danger" />
				<div className="flex-1">
					<p className="text-sm font-medium text-danger">Error</p>
					<p className="mt-1 text-sm text-danger/80">{event.data.message}</p>
					{event.data.code && <p className="mt-1 text-xs text-muted-fg">Code: {event.data.code}</p>}
				</div>
			</div>
			<time className="mt-2 block text-xs text-muted-fg">{event.timestamp.toLocaleTimeString()}</time>
		</div>
	)
}
