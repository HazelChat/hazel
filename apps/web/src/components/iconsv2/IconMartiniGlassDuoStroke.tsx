// duo-stroke/food
import type { Component, JSX } from "solid-js"

export const IconMartiniGlassDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 13v8m0 0h5.5M12 21H7"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m6 7 6 6 6-6M6 7 3 4h18l-3 3M6 7c3.993.333 8.007.333 12 0"
				fill="none"
			/>
		</svg>
	)
}

export default IconMartiniGlassDuoStroke
