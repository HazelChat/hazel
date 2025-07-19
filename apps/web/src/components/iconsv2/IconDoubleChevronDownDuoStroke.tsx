// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDoubleChevronDownDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8 7a20.4 20.4 0 0 0 3.702 3.894c.175.141.42.141.596 0A20.4 20.4 0 0 0 16 7"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 13a20.4 20.4 0 0 0 3.702 3.894c.175.141.42.141.596 0A20.4 20.4 0 0 0 16 13"
				fill="none"
			/>
		</svg>
	)
}

export default IconDoubleChevronDownDuoStroke
