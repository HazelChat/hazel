// duo-stroke/automotive
import type { Component, JSX } from "solid-js"

export const IconCyberTruckDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m22.5 10-.5 5h-2a2 2 0 1 0-4 0H8a2 2 0 1 0-4 0H1v-3l9-5z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCyberTruckDuoStroke
