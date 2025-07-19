// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconRefreshStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17.5 2.474A15 15 0 0 1 18.548 6.2a.48.48 0 0 1-.297.515l-.181.07M6.5 21.527A15 15 0 0 1 5.45 17.8a.48.48 0 0 1 .297-.515l.182-.07M14.5 7.67a15 15 0 0 0 3.57-.884m0 0a8 8 0 0 0-13.912 6.797m15.75-2.79A8 8 0 0 1 5.93 17.215m3.57-.885a15 15 0 0 0-3.57.884"
				fill="none"
			/>
		</svg>
	)
}

export default IconRefreshStroke
