// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconDivertLeftDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m22 9-6.879 6.879a3 3 0 0 1-4.242 0L3.295 8.295"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 8.289a20.8 20.8 0 0 0-5.347-.202.625.625 0 0 0-.566.566A20.8 20.8 0 0 0 3.29 14"
				fill="none"
			/>
		</svg>
	)
}

export default IconDivertLeftDuoStroke
