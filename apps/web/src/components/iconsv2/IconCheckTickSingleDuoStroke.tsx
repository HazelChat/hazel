// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconCheckTickSingleDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m5.5 12.5 4.517 5.225.4-.701a28.6 28.6 0 0 1 8.7-9.42L20 7"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m5.5 12.5 4.517 5.225"
				fill="none"
			/>
		</svg>
	)
}

export default IconCheckTickSingleDuoStroke
