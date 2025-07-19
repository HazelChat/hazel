// duo-stroke/time
import type { Component, JSX } from "solid-js"

export const IconAlarmPlusDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 3 2 6m17-3 3 3M12 16v-3m0 0v-3m0 3H9m3 0h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlarmPlusDuoStroke
