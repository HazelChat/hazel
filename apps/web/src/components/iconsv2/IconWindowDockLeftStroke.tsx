// stroke/devices
import type { Component, JSX } from "solid-js"

export const IconWindowDockLeftStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 17V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"
				fill="none"
			/>
			<path fill="currentColor" d="M11 8H7v8h4z" stroke="currentColor" />
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11 8H7v8h4z"
				fill="none"
			/>
		</svg>
	)
}

export default IconWindowDockLeftStroke
