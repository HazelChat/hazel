// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconFaceAngryDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m8.386 9.145 1.228.86m4.771 0 1.229-.86m-.044 6.856A5 5 0 0 0 12 14.5 5 5 0 0 0 8.43 16"
				fill="none"
			/>
		</svg>
	)
}

export default IconFaceAngryDuoStroke
