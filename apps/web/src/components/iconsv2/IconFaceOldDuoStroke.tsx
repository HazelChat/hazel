// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconFaceOldDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m8.386 10.004 1.228-.86m4.771 0 1.229.86M8.429 14.5A5 5 0 0 0 12 16a5 5 0 0 0 3.572-1.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconFaceOldDuoStroke
