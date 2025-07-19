// contrast/appliances
import type { Component, JSX } from "solid-js"

export const IconAcLeaf1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v6h20V6a2 2 0 0 0-2-2Z" />
				<path
					fill="currentColor"
					d="M16.677 16.072c-1.473.85-2.025 2.65-1.383 3.76.64 1.11 2.476 1.532 3.948.682s3.036-3.974 2.716-4.53c-.32-.555-3.81-.762-5.281.088Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18 8h-2m-1.198 14 .04-.11a6.13 6.13 0 0 1 2.317-2.963M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6zm-5.323 4.072c-1.473.85-2.025 2.65-1.383 3.76.64 1.11 2.476 1.532 3.948.682s3.036-3.974 2.716-4.53c-.32-.555-3.81-.762-5.281.088Z"
			/>
		</svg>
	)
}

export default IconAcLeaf1
