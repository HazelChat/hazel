import type { SlateLeafProps } from "platejs/static"

export function CodeLeafStatic(props: SlateLeafProps) {
	return (
		<code className="whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm">
			{props.children}
		</code>
	)
}
