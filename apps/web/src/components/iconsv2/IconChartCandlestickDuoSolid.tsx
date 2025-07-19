// duo-solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconChartCandlestickDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19 3a1 1 0 0 1 1 1v2.05a2.5 2.5 0 0 1 2 2.45v4a2.5 2.5 0 0 1-2 2.45V17a1 1 0 1 1-2 0v-2.05a2.5 2.5 0 0 1-2-2.45v-4a2.5 2.5 0 0 1 2-2.45V4a1 1 0 0 1 1-1ZM5 6a1 1 0 0 1 1 1v2.05a2.5 2.5 0 0 1 2 2.45v4a2.5 2.5 0 0 1-2 2.45V20a1 1 0 1 1-2 0v-2.05a2.5 2.5 0 0 1-2-2.45v-4a2.5 2.5 0 0 1 2-2.45V7a1 1 0 0 1 1-1Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M12 2a1 1 0 0 1 1 1v2.05a2.5 2.5 0 0 1 2 2.45v9a2.5 2.5 0 0 1-2 2.45V21a1 1 0 1 1-2 0v-2.05a2.5 2.5 0 0 1-2-2.45v-9a2.5 2.5 0 0 1 2-2.45V3a1 1 0 0 1 1-1Z"
			/>
		</svg>
	)
}

export default IconChartCandlestickDuoSolid
