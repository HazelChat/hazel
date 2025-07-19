// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigTurnRightDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.201 5q.232 1.995.33 4C6.998 9 2.998 11 2.998 19c3-4 7-4 11.535-4a61 61 0 0 1-.33 4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.201 5a35.3 35.3 0 0 1 6.558 6.307 1.11 1.11 0 0 1 0 1.386A35.3 35.3 0 0 1 14.2 19"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigTurnRightDuoStroke
