// stroke/security
import type { Component, JSX } from "solid-js"

export const IconShieldStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m5.496 4.314 5.388-1.946a3 3 0 0 1 2.038 0l5.465 1.974a3 3 0 0 1 1.972 2.591l.227 2.95A11 11 0 0 1 14.858 20.4l-1.49.806a3 3 0 0 1-2.914-.032l-1.52-.867A11 11 0 0 1 3.39 10.33l.127-3.31a3 3 0 0 1 1.98-2.705Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconShieldStroke
