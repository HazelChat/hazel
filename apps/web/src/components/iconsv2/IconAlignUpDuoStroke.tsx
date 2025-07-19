// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconAlignUpDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 4h14"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7.917 12.03a20.8 20.8 0 0 1 3.679-3.885A.64.64 0 0 1 12 8m4.083 4.03a20.8 20.8 0 0 0-3.678-3.885A.64.64 0 0 0 12 8m0 0v12"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlignUpDuoStroke
