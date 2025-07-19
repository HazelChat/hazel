// stroke/automotive
import type { Component, JSX } from "solid-js"

export const IconCyberTruckStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8 15a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m4 0h8M4 15H1v-3l9-5 12.5 3-.5 5h-2m0 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0"
				fill="none"
			/>
		</svg>
	)
}

export default IconCyberTruckStroke
