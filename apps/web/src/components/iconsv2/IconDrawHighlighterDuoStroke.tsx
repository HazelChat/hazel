// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconDrawHighlighterDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 17.935V15a2 2 0 0 0-2-2m-6 4.935V15a2 2 0 0 1 2-2m4 0h-4m4 0V9l-1-1-3 2v3"
				fill="none"
			/>
		</svg>
	)
}

export default IconDrawHighlighterDuoStroke
