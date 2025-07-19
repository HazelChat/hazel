// stroke/alerts
import type { Component, JSX } from "solid-js"

export const IconQuestionMarkCircleStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.281 9.719A2.719 2.719 0 1 1 13.478 12c-.724.47-1.478 1.137-1.478 2m0 3zm9-5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconQuestionMarkCircleStroke
