// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowTurnUpLeftDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 9h8c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C20 12.8 20 14.2 20 17v3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8.859 4a25.2 25.2 0 0 0-4.684 4.505.79.79 0 0 0 0 .99A25.2 25.2 0 0 0 8.859 14"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowTurnUpLeftDuoStroke
