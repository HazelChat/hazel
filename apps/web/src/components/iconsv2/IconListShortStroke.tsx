// stroke/general
import type { Component, JSX } from "solid-js"

export const IconListShortStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 9h16M4 14h8"
				fill="none"
			/>
		</svg>
	)
}

export default IconListShortStroke
