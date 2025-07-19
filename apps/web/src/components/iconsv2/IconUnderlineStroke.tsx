// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconUnderlineStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17 20H7M17 4v6.667a5 5 0 0 1-10 0V4"
				fill="none"
			/>
		</svg>
	)
}

export default IconUnderlineStroke
