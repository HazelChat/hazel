// stroke/alerts
import type { Component, JSX } from "solid-js"

export const IconExclamationMarkStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 5v9m0 5v.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconExclamationMarkStroke
