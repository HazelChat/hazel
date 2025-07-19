// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconTextParagraphStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13 3h5m-5 0H9.03a6.03 6.03 0 0 0 0 12.058H13M13 3v12.058M18 3v18m0-18h3m-8 18v-5.942"
				fill="none"
			/>
		</svg>
	)
}

export default IconTextParagraphStroke
