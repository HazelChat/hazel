// stroke/devices
import type { Component, JSX } from "solid-js"

export const IconAirplayStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8 14a5 5 0 1 1 8 0m2.233 3.493a9 9 0 1 0-12.466 0M9.887 21h4.226c.942 0 1.414 0 1.679-.197a1 1 0 0 0 .4-.723c.027-.33-.223-.73-.722-1.528l-.756-1.21c-.9-1.44-1.35-2.16-1.926-2.407a2 2 0 0 0-1.576 0c-.576.247-1.026.967-1.926 2.407l-.756 1.21c-.5.799-.749 1.198-.723 1.528a1 1 0 0 0 .401.723c.265.197.737.197 1.679.197ZM12 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAirplayStroke
