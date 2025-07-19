// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMergeStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 8.03a20.6 20.6 0 0 0-3.604-3.885A.62.62 0 0 0 12 4M8 8.03a20.6 20.6 0 0 1 3.604-3.885A.62.62 0 0 1 12 4m0 0v9l-6 7m12 0-3.429-4"
				fill="none"
			/>
		</svg>
	)
}

export default IconMergeStroke
