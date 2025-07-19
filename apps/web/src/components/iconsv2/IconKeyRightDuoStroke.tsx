// duo-stroke/security
import type { Component, JSX } from "solid-js"

export const IconKeyRightDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 12h4v3m-4-3h-8m8 0v2"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconKeyRightDuoStroke
