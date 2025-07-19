// stroke/development
import type { Component, JSX } from "solid-js"

export const IconPriorityBlockerStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m8.5 15.5 7-7M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPriorityBlockerStroke
