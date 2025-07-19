// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconGaugeSpeedometerTimerDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.85 12A9.15 9.15 0 1 0 12 2.85V6"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m8.464 8.465 4.108 2.803a.94.94 0 0 1-1.006 1.585.9.9 0 0 1-.299-.28z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGaugeSpeedometerTimerDuoStroke
