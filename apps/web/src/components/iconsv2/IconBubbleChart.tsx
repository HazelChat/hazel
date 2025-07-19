// solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconBubbleChart: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M15.5 3.1a5.4 5.4 0 1 0 0 10.8 5.4 5.4 0 0 0 0-10.8Z" fill="currentColor" />
			<path d="M6 10.1a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8Z" fill="currentColor" />
			<path d="M13.5 15.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z" fill="currentColor" />
		</svg>
	)
}

export default IconBubbleChart
