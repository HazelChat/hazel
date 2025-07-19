// stroke/media
import type { Component, JSX } from "solid-js"

export const IconAnimation02Stroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2 14a5 5 0 0 1 5 5v-1a9 9 0 0 1 5.237-8.178M19 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAnimation02Stroke
