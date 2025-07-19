// contrast/general
import type { Component, JSX } from "solid-js"

export const IconGridDashboardCircle1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path fill="currentColor" d="M3 6.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" />
				<path fill="currentColor" d="M3 17.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" />
				<path fill="currentColor" d="M14 6.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" />
				<path fill="currentColor" d="M14 17.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 6.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 17.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14 6.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14 17.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
			/>
		</svg>
	)
}

export default IconGridDashboardCircle1
