// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconDangerSkullDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19 14.419V10a7 7 0 1 0-14 0v4.419c0 .944.604 1.782 1.5 2.081A2.19 2.19 0 0 1 8 18.581v.094A2.325 2.325 0 0 0 10.325 21h3.35A2.325 2.325 0 0 0 16 18.675v-.094c0-.944.604-1.782 1.5-2.081a2.19 2.19 0 0 0 1.5-2.081Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.3 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15.7 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconDangerSkullDuoStroke
