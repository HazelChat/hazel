// duo-stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartMedianDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m7 7 .223-.276c1.391-1.722 4.104-1.396 5.048.606l3.458 7.34c.944 2.003 3.657 2.329 5.048.606L21 15m-7-1v.01M14 17v.01M14 5v.01M14 8v.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphChartMedianDuoStroke
