// stroke/general
import type { Component, JSX } from "solid-js"

export const IconThermometerDownStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7.572 10.019c-.634.846-1.37 1.61-2.19 2.275a.6.6 0 0 1-.381.135m-2.572-2.41c.635.846 1.371 1.61 2.192 2.275a.6.6 0 0 0 .38.135m0 0V6"
				fill="none"
			/>
		</svg>
	)
}

export default IconThermometerDownStroke
