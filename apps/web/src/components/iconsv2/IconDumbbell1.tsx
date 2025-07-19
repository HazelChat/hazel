// contrast/sports
import type { Component, JSX } from "solid-js"

export const IconDumbbell1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M7 5a2 2 0 0 1 2 2v8a2 2 0 1 1-4 0V7a2 2 0 0 1 2-2Z" />
				<path fill="currentColor" d="M17 5a2 2 0 0 1 2 2v8a2 2 0 1 1-4 0V7a2 2 0 0 1 2-2Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 11h6M5 9H4a2 2 0 1 0 0 4h1m14 0h1a2 2 0 1 0 0-4h-1m0 4V7a2 2 0 1 0-4 0v8a2 2 0 1 0 4 0zM7 17a2 2 0 0 0 2-2V7a2 2 0 1 0-4 0v8a2 2 0 0 0 2 2Z"
			/>
		</svg>
	)
}

export default IconDumbbell1
