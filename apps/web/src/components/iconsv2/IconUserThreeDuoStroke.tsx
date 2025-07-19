// duo-stroke/users
import type { Component, JSX } from "solid-js"

export const IconUserThreeDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.645 15.646A3.75 3.75 0 0 0 1 18.75a2.25 2.25 0 0 0 1.35 2.063m19.005-5.167A3.75 3.75 0 0 1 23 18.75a2.25 2.25 0 0 1-1.35 2.062M8.25 21h7.5A2.25 2.25 0 0 0 18 18.75 3.75 3.75 0 0 0 14.25 15h-4.5A3.75 3.75 0 0 0 6 18.75 2.25 2.25 0 0 0 8.25 21Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.706 3.723A4 4 0 0 0 3 7c0 1.356.674 2.554 1.706 3.277m14.588-6.554A4 4 0 0 1 21 7a4 4 0 0 1-1.706 3.277M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserThreeDuoStroke
