// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigTurnRight1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.76 11.307A35.3 35.3 0 0 0 14.201 5q.231 1.995.33 4C6.997 9 2.997 12 2.997 19c3-4 7-4 11.535-4a61 61 0 0 1-.33 4 35.3 35.3 0 0 0 6.557-6.307 1.11 1.11 0 0 0 0-1.386Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.759 11.307A35.3 35.3 0 0 0 14.2 5q.232 1.995.33 4C6.998 9 2.998 12 2.998 19c3-4 7-4 11.535-4a61 61 0 0 1-.33 4 35.3 35.3 0 0 0 6.557-6.307 1.11 1.11 0 0 0 0-1.386Z"
			/>
		</svg>
	)
}

export default IconArrowBigTurnRight1
