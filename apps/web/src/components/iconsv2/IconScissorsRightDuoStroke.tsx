// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconScissorsRightDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21 20.4 12.6 12m0 0L21 3.6M12.6 12l-3.454 3.454M12.601 12 9.146 8.545"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6.6 14.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.2 6A3.6 3.6 0 1 1 3 6a3.6 3.6 0 0 1 7.2 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconScissorsRightDuoStroke
