// duo-stroke/appliances
import type { Component, JSX } from "solid-js"

export const IconAcLeafDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 8h-2m-1.198 14 .04-.11a6.13 6.13 0 0 1 2.317-2.963m-.482-2.855c-1.472.85-2.025 2.65-1.383 3.76.64 1.11 2.476 1.532 3.948.682s3.037-3.974 2.716-4.53c-.32-.555-3.809-.762-5.281.088Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAcLeafDuoStroke
