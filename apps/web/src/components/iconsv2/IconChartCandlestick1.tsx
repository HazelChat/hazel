// contrast/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconChartCandlestick1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M12.5 6A1.5 1.5 0 0 1 14 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 11.5 6z"
				/>
				<path
					fill="currentColor"
					d="M21 8.5A1.5 1.5 0 0 0 19.5 7h-1A1.5 1.5 0 0 0 17 8.5v4a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5z"
				/>
				<path
					fill="currentColor"
					d="M7 11.5A1.5 1.5 0 0 0 5.5 10h-1A1.5 1.5 0 0 0 3 11.5v4A1.5 1.5 0 0 0 4.5 17h1A1.5 1.5 0 0 0 7 15.5z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 18h.5a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 6H12m0 12h-.5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 11.5 6h.5m0 12v3m0-15V3m7 4h.5A1.5 1.5 0 0 1 21 8.5v4a1.5 1.5 0 0 1-1.5 1.5H19m0-7h-.5A1.5 1.5 0 0 0 17 8.5v4a1.5 1.5 0 0 0 1.5 1.5h.5m0-7V4m0 10v3M5 10h.5A1.5 1.5 0 0 1 7 11.5v4A1.5 1.5 0 0 1 5.5 17H5m0-7h-.5A1.5 1.5 0 0 0 3 11.5v4A1.5 1.5 0 0 0 4.5 17H5m0-7V7m0 10v3"
			/>
		</svg>
	)
}

export default IconChartCandlestick1
