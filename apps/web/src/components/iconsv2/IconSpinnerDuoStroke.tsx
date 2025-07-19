// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconSpinnerDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19.078 19.079 16.25 16.25M19.078 5 16.25 7.828M4.92 19.078l2.83-2.828M4.92 5l2.83 2.828"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 12H2m20 0h-4M12 2v4m0 12v4"
				fill="none"
			/>
		</svg>
	)
}

export default IconSpinnerDuoStroke
