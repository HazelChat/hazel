// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconChevronLeft1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.106 11.702A20.4 20.4 0 0 1 14 8l-.304 4L14 16a20.4 20.4 0 0 1-3.894-3.702.47.47 0 0 1 0-.596Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.106 11.702A20.4 20.4 0 0 1 14 8a53 53 0 0 0 0 8 20.4 20.4 0 0 1-3.894-3.702.47.47 0 0 1 0-.596Z"
			/>
		</svg>
	)
}

export default IconChevronLeft1
