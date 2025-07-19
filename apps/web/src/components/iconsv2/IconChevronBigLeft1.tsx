// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconChevronBigLeft1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.183 12.51A30.6 30.6 0 0 0 15 18a72 72 0 0 1 0-12 30.6 30.6 0 0 0-5.817 5.49.8.8 0 0 0 0 1.02Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.183 12.51A30.6 30.6 0 0 0 15 18a72 72 0 0 1 0-12 30.6 30.6 0 0 0-5.817 5.49.8.8 0 0 0 0 1.02Z"
			/>
		</svg>
	)
}

export default IconChevronBigLeft1
