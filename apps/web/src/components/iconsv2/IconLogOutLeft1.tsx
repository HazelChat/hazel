// contrast/general
import type { Component, JSX } from "solid-js"

export const IconLogOutLeft1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3.157 11.556A15 15 0 0 1 5.812 9c-.1.994-.262 2-.262 3s.162 2.006.262 3a15 15 0 0 1-2.655-2.556.7.7 0 0 1 0-.888Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11 4.528A6 6 0 0 1 21 9v6a6 6 0 0 1-10 4.472"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5.55 12H16M5.55 12c0-1 .162-2.006.262-3a15 15 0 0 0-2.655 2.556.7.7 0 0 0 0 .888A15 15 0 0 0 5.812 15c-.1-.994-.262-2-.262-3Z"
			/>
		</svg>
	)
}

export default IconLogOutLeft1
