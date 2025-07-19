// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconChevronBigDown1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.49 14.817A30.6 30.6 0 0 1 6 9c3.993.333 8.007.333 12 0a30.6 30.6 0 0 1-5.49 5.817.8.8 0 0 1-1.02 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.49 14.817A30.6 30.6 0 0 1 6 9c3.993.333 8.007.333 12 0a30.6 30.6 0 0 1-5.49 5.817.8.8 0 0 1-1.02 0Z"
			/>
		</svg>
	)
}

export default IconChevronBigDown1
