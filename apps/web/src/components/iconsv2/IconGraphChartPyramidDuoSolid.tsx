// duo-solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartPyramidDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m19.373 16-2.707-5H7.334l-2.707 5m14.746 0 1.427 2.635c.573 1.059-.155 2.373-1.315 2.373H4.515c-1.16 0-1.888-1.314-1.315-2.373L4.627 16m14.746 0H4.627"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.685 4.811a1.478 1.478 0 0 1 2.63 0l3.351 6.19H7.334l3.35-6.19z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartPyramidDuoSolid
