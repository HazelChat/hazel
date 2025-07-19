// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowDownCircleStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8 12.051a20.3 20.3 0 0 0 3.604 3.807A.63.63 0 0 0 12 16m4-3.949a20.3 20.3 0 0 1-3.604 3.807A.63.63 0 0 1 12 16m0 0V8m9.15 4a9.15 9.15 0 1 1-18.3 0 9.15 9.15 0 0 1 18.3 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowDownCircleStroke
