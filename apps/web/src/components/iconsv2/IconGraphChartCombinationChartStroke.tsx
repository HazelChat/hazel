// stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartCombinationChartStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3.5 20v-5m5.333 5v-9m5.334 9v-5m5.333 5v-9m-16-1 5.333-5.5 5.334 5.5L19.5 4.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartCombinationChartStroke
