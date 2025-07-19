// stroke/media
import type { Component, JSX } from "solid-js"

export const IconPauseCircleStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.501 9v6m5-6v6m6.65-3a9.15 9.15 0 1 1-18.3 0 9.15 9.15 0 0 1 18.3 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPauseCircleStroke
