// stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartGanttStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 21H7a4 4 0 0 1-4-4V3m4 4h3m0 5h7m0 5h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartGanttStroke
