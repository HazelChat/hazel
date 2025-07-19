// duo-stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconTrendlineDownDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m2 7.148.73.937a21.8 21.8 0 0 0 6.61 5.664c.316.176.715.08.916-.222l3.212-4.818a.64.64 0 0 1 .926-.15 20.05 20.05 0 0 1 5.944 7.53l.321.707"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 12.174a17.3 17.3 0 0 1-1.123 4.38.476.476 0 0 1-.51.293 17.3 17.3 0 0 1-4.353-1.217"
				fill="none"
			/>
		</svg>
	)
}

export default IconTrendlineDownDuoStroke
