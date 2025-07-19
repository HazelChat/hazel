// stroke/weather
import type { Component, JSX } from "solid-js"

export const IconCloudWindStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2 14h11a2 2 0 1 0-1-3.732M2 18h8a2 2 0 1 1-1 3.732M15.582 18h.918a5.5 5.5 0 0 0 2.168-10.556A6.5 6.5 0 0 0 6.017 9.026m0 0A4.5 4.5 0 0 0 3.671 10m2.346-.974c-.023.321-.023.652.002.974"
				fill="none"
			/>
		</svg>
	)
}

export default IconCloudWindStroke
