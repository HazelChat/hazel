// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconFontAaDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2 19 6.358 6.157a1.744 1.744 0 0 1 3.302.053L14 19m-9.964-6h7.928"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 12v6m0-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFontAaDuoStroke
