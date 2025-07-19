// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDoubleChevronRightStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13 8a20.4 20.4 0 0 1 3.894 3.702.47.47 0 0 1 0 .596A20.4 20.4 0 0 1 13 16M7 8a20.4 20.4 0 0 1 3.894 3.702.47.47 0 0 1 0 .596A20.4 20.4 0 0 1 7 16"
				fill="none"
			/>
		</svg>
	)
}

export default IconDoubleChevronRightStroke
