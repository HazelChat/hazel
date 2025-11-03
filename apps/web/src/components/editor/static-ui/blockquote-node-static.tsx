import type { SlateElementProps } from "platejs/static"

export function BlockquoteElementStatic(props: SlateElementProps) {
	return (
		<blockquote className="relative my-1 pl-4 italic">
			<span className="absolute top-0 left-0 h-full w-1 rounded-[2px] bg-primary" aria-hidden="true" />
			{props.children}
		</blockquote>
	)
}
