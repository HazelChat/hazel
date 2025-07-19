// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconSearchBigDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17.51 17.51 21 21"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 11.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconSearchBigDuoStroke
