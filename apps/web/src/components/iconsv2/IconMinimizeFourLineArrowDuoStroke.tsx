// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMinimizeFourLineArrowDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.222 15.222 21 21M8.778 8.778 3 3m5.778 12.222L3 21M15.222 8.778 21 3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 15.24a17.3 17.3 0 0 0-4.456-.167.52.52 0 0 0-.471.471A17.3 17.3 0 0 0 15.24 20M4 8.76a17.3 17.3 0 0 0 4.456.167.52.52 0 0 0 .471-.471C9.064 6.98 9.007 5.482 8.76 4M4 15.24a17.3 17.3 0 0 1 4.456-.167.52.52 0 0 1 .471.471c.137 1.476.08 2.974-.167 4.456M20 8.76a17.3 17.3 0 0 1-4.456.167.52.52 0 0 1-.471-.471A17.3 17.3 0 0 1 15.24 4"
				fill="none"
			/>
		</svg>
	)
}

export default IconMinimizeFourLineArrowDuoStroke
