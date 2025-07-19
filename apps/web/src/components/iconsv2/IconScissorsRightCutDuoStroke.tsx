// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconScissorsRightCutDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m18.709 19.264-7.389-7.389m0 0 7.389-7.388m-7.389 7.388-3.039 3.039m3.039-3.039L8.281 8.836"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17.125 11.875h-1m5 0h-1M8.281 14.914a3.167 3.167 0 1 0-4.478 4.478 3.167 3.167 0 0 0 4.478-4.478Zm0-6.078a3.167 3.167 0 1 0-4.478-4.478A3.167 3.167 0 0 0 8.28 8.836Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconScissorsRightCutDuoStroke
