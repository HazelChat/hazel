// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconHeadingH5DuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 12h8m-8 6V6m8 12V6"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.5 10h-3a1.5 1.5 0 0 0-1.5 1.5V14h3a2 2 0 1 1 0 4h-3"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeadingH5DuoStroke
