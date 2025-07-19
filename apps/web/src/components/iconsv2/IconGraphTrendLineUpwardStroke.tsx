// stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphTrendLineUpwardStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 21H7a4 4 0 0 1-4-4V3m4 11 .61-1.83c.745-2.236 3.92-2.199 4.612.053.643 2.088 3.504 2.325 4.481.37l2.463-4.925m0 0c.12.06.22.16.28.291.435.962.75 1.975.938 3.016m-1.218-3.307a.6.6 0 0 0-.4-.05 13 13 0 0 0-2.979 1.05"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphTrendLineUpwardStroke
