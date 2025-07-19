// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconScissorsLeftDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.4 12 3 3.6m8.4 8.4 3.454 3.454M11.4 12l3.454-3.455M11.4 12 3 20.4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.854 15.455a3.6 3.6 0 1 1 5.091 5.091 3.6 3.6 0 0 1-5.09-5.091Zm0-6.91a3.6 3.6 0 1 1 5.091-5.09 3.6 3.6 0 0 1-5.09 5.09Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconScissorsLeftDuoStroke
