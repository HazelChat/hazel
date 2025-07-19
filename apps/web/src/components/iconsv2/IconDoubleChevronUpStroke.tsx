// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDoubleChevronUpStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8 11a20.4 20.4 0 0 1 3.702-3.894.47.47 0 0 1 .596 0A20.4 20.4 0 0 1 16 11m-8 6a20.4 20.4 0 0 1 3.702-3.894.47.47 0 0 1 .596 0A20.4 20.4 0 0 1 16 17"
				fill="none"
			/>
		</svg>
	)
}

export default IconDoubleChevronUpStroke
