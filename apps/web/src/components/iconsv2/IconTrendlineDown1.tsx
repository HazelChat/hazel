// contrast/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconTrendlineDown1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.877 16.553A17.3 17.3 0 0 0 22 12.174l-1.152.806a23.7 23.7 0 0 1-3.56 2.055l-1.274.595a17.3 17.3 0 0 0 4.354 1.217.476.476 0 0 0 .509-.294Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m2 7.148.73.937a21.8 21.8 0 0 0 6.61 5.664c.316.176.715.08.916-.222l3.212-4.818a.64.64 0 0 1 .926-.15 20 20 0 0 1 4.848 5.45m0 0a24 24 0 0 0 1.605-1.029L22 12.174a17.3 17.3 0 0 1-1.123 4.38.476.476 0 0 1-.51.293 17.3 17.3 0 0 1-4.353-1.217l1.274-.595a24 24 0 0 0 1.954-1.025Z"
			/>
		</svg>
	)
}

export default IconTrendlineDown1
