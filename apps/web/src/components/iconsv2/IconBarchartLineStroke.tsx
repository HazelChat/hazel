// stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconBarchartLineStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 20v-6m6 6V4m6 16V10"
				fill="none"
			/>
		</svg>
	)
}

export default IconBarchartLineStroke
