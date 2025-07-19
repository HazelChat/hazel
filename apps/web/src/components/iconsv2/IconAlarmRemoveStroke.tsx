// stroke/time
import type { Component, JSX } from "solid-js"

export const IconAlarmRemoveStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 3 2 6m17-3 3 3M9 13h6m5 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlarmRemoveStroke
