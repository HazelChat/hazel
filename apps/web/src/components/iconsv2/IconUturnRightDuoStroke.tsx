// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconUturnRightDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 8H9a5 5 0 0 0 0 10h3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.969 3.916a20.8 20.8 0 0 1 3.886 3.679.64.64 0 0 1 0 .809 20.8 20.8 0 0 1-3.886 3.679"
				fill="none"
			/>
		</svg>
	)
}

export default IconUturnRightDuoStroke
