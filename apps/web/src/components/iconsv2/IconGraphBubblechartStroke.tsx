// stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphBubblechartStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 21H7a4 4 0 0 1-4-4V3m16 2.01V5m-8 5.01V10m-1 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm9-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphBubblechartStroke
