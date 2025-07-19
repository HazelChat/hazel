// stroke/general
import type { Component, JSX } from "solid-js"

export const IconThermometerMinusStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 5a3 3 0 1 0-6 0v10.354a4 4 0 1 0 6 0z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 0v-7"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 7h6"
				fill="none"
			/>
		</svg>
	)
}

export default IconThermometerMinusStroke
