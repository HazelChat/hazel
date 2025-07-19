// duo-stroke/maths
import type { Component, JSX } from "solid-js"

export const IconEqualsCancelDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 9h9.333M15 15h4m-.02-6H19M5 15h4.667"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 21 19 3"
				fill="none"
			/>
		</svg>
	)
}

export default IconEqualsCancelDuoStroke
