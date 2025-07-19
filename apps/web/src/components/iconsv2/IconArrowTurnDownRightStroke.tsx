// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowTurnDownRightStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15.141 20a25.2 25.2 0 0 0 4.684-4.505A.8.8 0 0 0 20 15m-4.859-5a25.2 25.2 0 0 1 4.684 4.505A.8.8 0 0 1 20 15m0 0h-8c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C4 11.2 4 9.8 4 7V4"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowTurnDownRightStroke
