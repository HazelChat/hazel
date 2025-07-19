// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignVerticalCenterDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 12h14"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 6.684a16.4 16.4 0 0 0 2.703 3.197A.44.44 0 0 0 12 10m3-3.316a16.4 16.4 0 0 1-2.703 3.197A.44.44 0 0 1 12 10m0 0V3m3 14.316a16.4 16.4 0 0 0-2.703-3.197A.44.44 0 0 0 12 14m-3 3.316a16.4 16.4 0 0 1 2.703-3.197A.44.44 0 0 1 12 14m0 0v7"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlignVerticalCenterDuoStroke
