// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconRotateLeftDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.739 7.017A8 8 0 1 1 4.25 14"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6.215 2.67a15 15 0 0 0-1.049 3.726c-.049.335.215.485.479.586l.094.035a15 15 0 0 0 3.476.85"
				fill="none"
			/>
		</svg>
	)
}

export default IconRotateLeftDuoStroke
