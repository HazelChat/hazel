// duo-stroke/medical
import type { Component, JSX } from "solid-js"

export const IconBottleSoapDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9 8h6M9 8a3 3 0 0 0-3 3v4.75M9 8V6a1 1 0 0 1 1-1h2m3 3a3 3 0 0 1 3 3v4.75M15 8V6a1 1 0 0 0-1-1h-2m0-3v3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.5 2h6.919c.944 0 1.782.604 2.081 1.5"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18 15.978c-6 1.608-6.248-3.541-12-1.486V20.5A1.5 1.5 0 0 0 7.5 22h9a1.5 1.5 0 0 0 1.5-1.5z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBottleSoapDuoStroke
