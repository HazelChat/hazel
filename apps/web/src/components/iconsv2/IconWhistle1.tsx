// contrast/sports
import type { Component, JSX } from "solid-js"

export const IconWhistle1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 11v1.687a1 1 0 0 1-.796.979l-6.23 1.298q.026.264.026.536A5.5 5.5 0 1 1 8.5 10H20a1 1 0 0 1 1 1Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11 10h9a1 1 0 0 1 1 1v1.687a1 1 0 0 1-.796.979l-6.23 1.298q.026.264.026.536A5.5 5.5 0 1 1 8.5 10zm0 0v2m0-9v3m5-1-1 1M6 5l1 1"
			/>
		</svg>
	)
}

export default IconWhistle1
