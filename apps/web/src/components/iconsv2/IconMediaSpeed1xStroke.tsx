// stroke/media
import type { Component, JSX } from "solid-js"

export const IconMediaSpeed1xStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.022 19V5c-1.805.442-3.185 1.685-4.003 3.323"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m13 19 3.5-4.5m0 0L20 10m-3.5 4.5L20 19m-3.5-4.5L13 10"
				fill="none"
			/>
		</svg>
	)
}

export default IconMediaSpeed1xStroke
