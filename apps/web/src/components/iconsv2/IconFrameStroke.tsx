// stroke/editing
import type { Component, JSX } from "solid-js"

export const IconFrameStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7 3v4m0 0v10M7 7h10M7 7H3m4 10v4m0-4h10M7 17H3M21 7h-4m0 0V3m0 4v10m0 0v4m0-4h4"
				fill="none"
			/>
		</svg>
	)
}

export default IconFrameStroke
