// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconGaugeSpeedometerDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.242 19.15a9.15 9.15 0 1 1 13.816 0"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5.242 19.15a9.1 9.1 0 0 1-2.242-6 9.1 9.1 0 0 1 1.96-5.66m3.454 2.923 4.108 2.803a.94.94 0 1 1-1.305 1.305z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGaugeSpeedometerDuoStroke
