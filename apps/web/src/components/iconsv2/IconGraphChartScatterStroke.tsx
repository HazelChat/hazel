// stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartScatterStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 21H7a4 4 0 0 1-4-4V3"
				fill="none"
			/>
			<circle
				cx="8"
				cy="16"
				r="1"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				fill="none"
			/>
			<circle
				cx="9"
				cy="8"
				r="1"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				fill="none"
			/>
			<circle
				cx="14"
				cy="12"
				r="1"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				fill="none"
			/>
			<circle
				cx="19"
				cy="16"
				r="1"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				fill="none"
			/>
			<circle
				cx="18"
				cy="5"
				r="1"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartScatterStroke
