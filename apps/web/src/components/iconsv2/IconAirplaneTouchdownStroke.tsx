// stroke/automotive
import type { Component, JSX } from "solid-js"

export const IconAirplaneTouchdownStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 20h18M5.468 13.633l13.366 3.582a1 1 0 0 0 1.224-.707 3 3 0 0 0-2.12-3.675l-2.899-.776-4.09-8.318a3 3 0 0 0-1.915-1.574L8.417 2l.827 8.504-2.898-.777-2.18-2.48a1 1 0 0 0-.493-.306L3 6.76l.25 4.154a3 3 0 0 0 2.218 2.718z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAirplaneTouchdownStroke
