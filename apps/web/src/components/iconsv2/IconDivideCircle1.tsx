// contrast/maths
import type { Component, JSX } from "solid-js"

export const IconDivideCircle1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21.15 12a9.15 9.15 0 1 1-18.3 0 9.15 9.15 0 0 1 18.3 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 12h8m-4-4zm0 8zm9.15-4a9.15 9.15 0 1 1-18.3 0 9.15 9.15 0 0 1 18.3 0Z"
			/>
		</svg>
	)
}

export default IconDivideCircle1
