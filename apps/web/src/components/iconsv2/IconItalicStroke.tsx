// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconItalicStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m13.5 5-3 14m3-14H17m-3.5 0H10m.5 14H14m-3.5 0H7"
				fill="none"
			/>
		</svg>
	)
}

export default IconItalicStroke
