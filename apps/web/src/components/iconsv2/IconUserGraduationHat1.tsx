// contrast/users
import type { Component, JSX } from "solid-js"

export const IconUserGraduationHat1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				<path
					fill="currentColor"
					d="M16 15H8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 4 4 0 0 0-4-4Z"
				/>
				<path fill="currentColor" d="m5 4 7-2 7 2-7 2z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m5 4 7-2 7 2-3.53 1.009M5 4l3.53 1.009M5 4v3m10.47-1.991L12 6l-3.47-.991m6.94 0a4 4 0 1 1-6.94 0M8 15a4 4 0 0 0-4 4 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 4 4 0 0 0-4-4z"
			/>
		</svg>
	)
}

export default IconUserGraduationHat1
