import { IconFile } from "~/components/icons/icon-file"
import { IconCode } from "~/components/icons/icon-code"
import type { FileRefEvent as FileRefEventType } from "~/atoms/agent-session-atoms"

interface FileRefEventProps {
	event: FileRefEventType
}

export function FileRefEvent({ event }: FileRefEventProps) {
	const { path, language } = event.data

	return (
		<div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 p-3">
			{language ? (
				<IconCode className="size-4 fill-info" />
			) : (
				<IconFile className="size-4 fill-muted-fg" />
			)}
			<div className="flex-1 min-w-0">
				<p className="truncate text-sm font-mono">{path}</p>
				{language && <p className="text-xs text-muted-fg">{language}</p>}
			</div>
			<time className="text-xs text-muted-fg">{event.timestamp.toLocaleTimeString()}</time>
		</div>
	)
}
