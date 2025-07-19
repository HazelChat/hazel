// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconHashtagDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m7 20 3-16m4 16 3-16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19.5 15h-16m17-6h-16"
				fill="none"
			/>
		</svg>
	)
}

export default IconHashtagDuoStroke
