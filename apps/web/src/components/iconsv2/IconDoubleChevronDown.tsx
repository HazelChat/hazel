// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDoubleChevronDown: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.075 6.003a1 1 0 0 0-.884 1.585 21.4 21.4 0 0 0 3.884 4.085 1.47 1.47 0 0 0 1.85 0 21.4 21.4 0 0 0 3.884-4.085 1 1 0 0 0-.884-1.585l-2.205.165a23 23 0 0 1-3.44 0z"
				fill="currentColor"
			/>
			<path
				d="M8.075 12.003a1 1 0 0 0-.884 1.585 21.4 21.4 0 0 0 3.884 4.085 1.47 1.47 0 0 0 1.85 0 21.4 21.4 0 0 0 3.884-4.085 1 1 0 0 0-.884-1.585l-2.205.165a23 23 0 0 1-3.44 0z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDoubleChevronDown
