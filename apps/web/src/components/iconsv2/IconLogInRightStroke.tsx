// stroke/general
import type { Component, JSX } from "solid-js"

export const IconLogInRightStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.812 9a15 15 0 0 0-2.655 2.556A.7.7 0 0 0 8 12m2.812 3a15 15 0 0 1-2.655-2.556A.7.7 0 0 1 8 12m0 0h13m-8-7.472A6 6 0 0 0 3 9v6a6 6 0 0 0 10 4.472"
				fill="none"
			/>
		</svg>
	)
}

export default IconLogInRightStroke
