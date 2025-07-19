// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconHeadingH1DuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19 18v-8c-.962.236-1.698.898-2.134 1.771M19 18h-2.5m2.5 0h2.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeadingH1DuoStroke
