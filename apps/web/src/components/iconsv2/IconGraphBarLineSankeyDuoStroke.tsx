// duo-stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphBarLineSankeyDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 6H6m15 11h-1.718a8 8 0 0 1-6.657-3.562l-.096-.144M21 10h-2a8 8 0 0 0-6.4 3.2l-.07.094m0 0L11.4 14.8a8 8 0 0 1-4.9 3.058m6.03-4.564-1.155-1.732A8 8 0 0 0 6 8.103"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21H7a4 4 0 0 1-4-4V3"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphBarLineSankeyDuoStroke
