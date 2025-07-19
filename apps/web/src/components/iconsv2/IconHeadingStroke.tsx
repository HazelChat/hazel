// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconHeadingStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 20v-8m0-8v8m12 8v-8m0-8v8m0 0H6"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeadingStroke
