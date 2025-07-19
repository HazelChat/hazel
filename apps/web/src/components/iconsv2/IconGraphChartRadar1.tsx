// contrast/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGraphChartRadar1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m3.987 8.114 6.19-4.498a3.1 3.1 0 0 1 3.645 0l6.19 4.498a3.1 3.1 0 0 1 1.127 3.466l-2.365 7.278A3.1 3.1 0 0 1 15.826 21H8.174a3.1 3.1 0 0 1-2.948-2.142L2.86 11.58a3.1 3.1 0 0 1 1.126-3.466Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m3.987 8.114 6.19-4.498a3.1 3.1 0 0 1 3.645 0l6.19 4.498a3.1 3.1 0 0 1 1.127 3.466l-2.365 7.278A3.1 3.1 0 0 1 15.826 21H8.174a3.1 3.1 0 0 1-2.948-2.142L2.86 11.58a3.1 3.1 0 0 1 1.126-3.466Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 3.001v5.976m0 0 3.756 2.307M12 8.977l-3.756 2.307M2.857 9.601l5.387 1.683m0 0L10.189 15m10.954-5.399-5.387 1.683m0 0L15.236 17m2.436 3.42L15.236 17m0 0-5.047-2m-3.861 5.42 3.86-5.42"
			/>
		</svg>
	)
}

export default IconGraphChartRadar1
