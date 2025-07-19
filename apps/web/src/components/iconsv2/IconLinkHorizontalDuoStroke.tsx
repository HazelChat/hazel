// duo-stroke/development
import type { Component, JSX } from "solid-js"

export const IconLinkHorizontalDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 7h1a5 5 0 0 1 0 10h-1M9 7H8a5 5 0 0 0 0 10h1"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 12H9"
				fill="none"
			/>
		</svg>
	)
}

export default IconLinkHorizontalDuoStroke
