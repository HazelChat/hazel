// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignLeft: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				d="M20 11a1 1 0 1 1 0 2h-7.124q.03 1.503.152 3.003a1 1 0 0 1-1.59.886 21.8 21.8 0 0 1-4.069-3.853 1.64 1.64 0 0 1 0-2.072 21.8 21.8 0 0 1 4.069-3.853 1 1 0 0 1 1.59.886q-.122 1.5-.152 3.003z"
				fill="currentColor"
			/>
			<path d="M5 19a1 1 0 1 1-2 0V5a1 1 0 1 1 2 0z" fill="currentColor" />
		</svg>
	)
}

export default IconAlignLeft
