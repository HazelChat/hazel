// duo-stroke/alerts
import type { Component, JSX } from "solid-js"

export const IconQuestionMarkDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7.728 9.272a4.272 4.272 0 1 1 6.595 3.586C13.185 13.596 12 14.644 12 16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 19h.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconQuestionMarkDuoStroke
