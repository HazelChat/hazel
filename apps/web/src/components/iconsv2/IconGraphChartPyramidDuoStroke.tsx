// duo-stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartPyramidDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				fill-rule="evenodd"
				d="M14.194 4.335a2.478 2.478 0 0 0-4.39 0L7.68 8.262A.5.5 0 0 0 8.12 9h7.762a.5.5 0 0 0 .44-.738z"
				clip-rule="evenodd"
			/>
			<path
				fill="currentColor"
				d="M17.505 11a.5.5 0 0 1 .44.262l1.624 3a.5.5 0 0 1-.44.738H4.869a.5.5 0 0 1-.44-.738l1.626-3a.5.5 0 0 1 .44-.262zm-14.7 6.262-.485.897c-.895 1.653.197 3.849 2.195 3.849h14.97c1.998 0 3.09-2.196 2.195-3.849l-.486-.897a.5.5 0 0 0-.44-.262H3.246a.5.5 0 0 0-.44.262Z"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconGraphChartPyramidDuoStroke
