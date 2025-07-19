// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDivertLeft1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3.653 8.087A20.8 20.8 0 0 1 9 8.29l-1.1.88a24 24 0 0 0-3.73 3.73L3.288 14a20.8 20.8 0 0 1-.202-5.347.625.625 0 0 1 .566-.566Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m22 9-6.879 6.879a3 3 0 0 1-4.242 0l-4.947-4.947m0 0A24 24 0 0 1 7.9 9.169L9 8.29a20.8 20.8 0 0 0-5.347-.202.625.625 0 0 0-.566.566A20.8 20.8 0 0 0 3.29 14l.88-1.1a24 24 0 0 1 1.763-1.968Z"
			/>
		</svg>
	)
}

export default IconDivertLeft1
