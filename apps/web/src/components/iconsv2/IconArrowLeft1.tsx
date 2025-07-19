// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowLeft1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M4.21 12.594A30.2 30.2 0 0 0 9.83 18l-.3-6 .3-6a30.2 30.2 0 0 0-5.62 5.406.95.95 0 0 0 0 1.188Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m9.53 12 .3 6a30.2 30.2 0 0 1-5.62-5.406.95.95 0 0 1 0-1.188A30.2 30.2 0 0 1 9.83 6zm0 0H20"
			/>
		</svg>
	)
}

export default IconArrowLeft1
