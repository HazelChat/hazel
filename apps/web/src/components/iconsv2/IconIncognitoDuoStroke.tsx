// duo-stroke/media
import type { Component, JSX } from "solid-js"

export const IconIncognitoDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m19.583 9.718-2.611-4.897a3 3 0 0 0-3.02-1.565 14.6 14.6 0 0 1-3.904 0A3 3 0 0 0 7.03 4.821L4.417 9.718M10 17h4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 10.26a40 40 0 0 1 2.417-.542 40.4 40.4 0 0 1 15.166 0q1.222.234 2.417.542M10 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconIncognitoDuoStroke
