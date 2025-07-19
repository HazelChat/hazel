// duo-stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconPiechartRingDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.85 12a9.15 9.15 0 0 1 15.848-6.234l-4.357 4.358A3 3 0 0 0 9 12m-6.15 0A9.15 9.15 0 0 0 12 21.15V15a3 3 0 0 1-3-3m-6.15 0H9"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 21.15a9.15 9.15 0 0 0 6.698-15.384l-4.357 4.358A3 3 0 0 1 12 15z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPiechartRingDuoStroke
