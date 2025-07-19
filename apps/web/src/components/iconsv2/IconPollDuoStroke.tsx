// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconPollDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13 17h8M9 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 7h8M6 7h.01M9 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPollDuoStroke
