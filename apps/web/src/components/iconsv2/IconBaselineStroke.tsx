// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconBaselineStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m6 16 2.982-8.45c.927-2.625 1.39-3.937 2.072-4.303a2 2 0 0 1 1.892 0c.682.366 1.145 1.678 2.072 4.303L18 16M8 11h8m1 9H7"
				fill="none"
			/>
		</svg>
	)
}

export default IconBaselineStroke
