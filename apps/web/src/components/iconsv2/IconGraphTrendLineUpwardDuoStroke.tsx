// duo-stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphTrendLineUpwardDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m7 14 .61-1.83c.745-2.236 3.92-2.199 4.612.053.643 2.088 3.504 2.325 4.481.37l2.463-4.925m0 0c.12.06.22.161.28.291.435.963.75 1.975.938 3.016m-1.218-3.307a.6.6 0 0 0-.4-.05c-1.032.227-2.032.58-2.979 1.05"
				fill="none"
			/>
		</svg>
	)
}

export default IconGraphTrendLineUpwardDuoStroke
