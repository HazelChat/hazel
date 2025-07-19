// contrast/general
import type { Component, JSX } from "solid-js"

export const IconThermometer1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M15 5a3 3 0 1 0-6 0v10.354a4 4 0 1 0 6 0z" opacity=".28" />
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 5a3 3 0 1 0-6 0v10.354a4 4 0 1 0 6 0z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 0v-7"
			/>
		</svg>
	)
}

export default IconThermometer1
