// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconThreeDotsMenuHorizontalCircleDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (
	props,
) => {
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
				d="M21.15 12a9.15 9.15 0 1 0-18.3 0 9.15 9.15 0 0 0 18.3 0Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 12h.01M12 12h.01M16 12h.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconThreeDotsMenuHorizontalCircleDuoStroke
