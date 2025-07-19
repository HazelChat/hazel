// contrast/general
import type { Component, JSX } from "solid-js"

export const IconLogInRight1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.157 11.556A15 15 0 0 1 10.812 9c-.1.994-.262 2-.262 3s.162 2.006.261 3a15 15 0 0 1-2.654-2.556.7.7 0 0 1 0-.888Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.55 12H21m-10.45 0c0-1 .162-2.006.261-3a15 15 0 0 0-2.654 2.556.7.7 0 0 0 0 .888A15 15 0 0 0 10.812 15c-.1-.994-.262-2-.262-3ZM13 4.528A6 6 0 0 0 3 9v6a6 6 0 0 0 10 4.472"
			/>
		</svg>
	)
}

export default IconLogInRight1
