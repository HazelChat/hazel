// duo-stroke/medical
import type { Component, JSX } from "solid-js"

export const IconPrescriptionRxDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m12.003 21 4-4m0 0 4-4m-4 4 4 4m-4-4-4-4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.003 9V3h6a3 3 0 1 1 0 6h-2m-4 0v6m0-6h4m0 0 4 4"
				fill="none"
			/>
		</svg>
	)
}

export default IconPrescriptionRxDuoStroke
