// duo-stroke/appliances
import type { Component, JSX } from "solid-js"

export const IconAcOnSlowDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20 4H4a2 2 0 0 0-2 2v6h20V6a2 2 0 0 0-2-2Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18 8h-2m-4 8v4m5-4v2.8M7 16v2.8"
				fill="none"
			/>
		</svg>
	)
}

export default IconAcOnSlowDuoStroke
