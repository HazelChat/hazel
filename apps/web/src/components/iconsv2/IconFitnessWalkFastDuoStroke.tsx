// duo-stroke/sports
import type { Component, JSX } from "solid-js"

export const IconFitnessWalkFastDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-linejoin="round"
				stroke-width="2"
				d="M14 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m21 22-2.406-4.812a5 5 0 0 0-1.699-1.924l-1.004-.67A2 2 0 0 1 15 12.93V7l-2.58 1.935a5 5 0 0 0-1.85 2.787L10 14"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m13.5 17.5-.094.47a5 5 0 0 1-2.13 3.179L10 22"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 10h-1.586C19.51 10 18.64 9.64 18 9"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 4H5m2 5H2m4 6H3m4 5H2"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconFitnessWalkFastDuoStroke
