// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconCommandCmdKStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4.667 13.833H2.833a1.833 1.833 0 1 0 1.834 1.834zm0 0h3.666m-3.666 0v-3.666m3.666 3.666h1.834a1.833 1.833 0 1 1-1.834 1.834zm0 0v-3.666m0 0V8.333a1.833 1.833 0 1 1 1.834 1.834zm0 0H4.667m0 0H2.833a1.833 1.833 0 1 1 1.834-1.834zM16 6.5V14m0 0v3.5m0-3.5 2.041-2.041m0 0L22.922 6.5m-4.88 5.459a8.86 8.86 0 0 1 4.84 5.201l.118.34"
				fill="none"
			/>
		</svg>
	)
}

export default IconCommandCmdKStroke
