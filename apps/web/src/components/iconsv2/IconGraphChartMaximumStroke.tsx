// stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartMaximumStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 21H7a4 4 0 0 1-4-4V3m5 2h.01M11 5h.01M17 5h.01M20 5h.01m-6.02 0H14M7 17c.827-5.183 3.648-9 7-9s6.172 3.817 7 9"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartMaximumStroke
