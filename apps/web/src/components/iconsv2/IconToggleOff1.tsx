// contrast/general
import type { Component, JSX } from "solid-js"

export const IconToggleOff1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M9 5h6a7 7 0 1 1 0 14H9A7 7 0 1 1 9 5Z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 5h6a7 7 0 1 1 0 14H9A7 7 0 1 1 9 5Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
			/>
		</svg>
	)
}

export default IconToggleOff1
