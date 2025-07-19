// stroke/devices
import type { Component, JSX } from "solid-js"

export const IconTrackpadStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<rect
				width="20"
				height="18"
				x="2"
				y="3"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				rx="4"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 13h10m10 0H12m0 0v8"
				fill="none"
			/>
		</svg>
	)
}

export default IconTrackpadStroke
