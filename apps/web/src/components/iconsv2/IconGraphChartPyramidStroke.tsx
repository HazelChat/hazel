// stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartPyramidStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m19.373 16.069 1.427 2.635c.573 1.059-.155 2.373-1.315 2.373H4.515c-1.16 0-1.888-1.314-1.315-2.373l1.427-2.635m14.746 0H4.627m14.746 0-2.707-5m-12.04 5 2.708-5m9.332 0-3.35-6.19a1.478 1.478 0 0 0-2.631 0l-3.351 6.19m9.332 0H7.334"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartPyramidStroke
