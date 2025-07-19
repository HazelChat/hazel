// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignRightStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.97 16a20.8 20.8 0 0 0 3.885-3.679.64.64 0 0 0 .145-.404m-4.03-4.084a20.8 20.8 0 0 1 3.885 3.68.64.64 0 0 1 .145.404m0 0H4M20 19V5"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlignRightStroke
