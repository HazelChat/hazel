// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigTurnLeftStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3.241 11.307A35.3 35.3 0 0 1 9.8 5a61 61 0 0 0-.33 4c7.534 0 11.534 3 11.534 10-3-4-7-4-11.535-4q.1 2.005.33 4a35.3 35.3 0 0 1-6.557-6.307 1.11 1.11 0 0 1 0-1.386Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigTurnLeftStroke
