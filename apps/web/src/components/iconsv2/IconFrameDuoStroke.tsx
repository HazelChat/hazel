// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconFrameDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 17h-4v4m0-18v4h4M3 7h4V3m0 18v-4H3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17 17V7H7v10z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFrameDuoStroke
