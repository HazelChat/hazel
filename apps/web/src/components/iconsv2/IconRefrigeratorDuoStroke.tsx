// duo-stroke/appliances
import type { Component, JSX } from "solid-js"

export const IconRefrigeratorDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19 10V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C17.48 2 16.92 2 15.8 2H8.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C5 3.52 5 4.08 5 5.2V10m14 0v8.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C17.48 22 16.92 22 15.8 22H8.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C5 20.48 5 19.92 5 18.8V10m14 0H5"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 5.5v1m0 7v2"
				fill="none"
			/>
		</svg>
	)
}

export default IconRefrigeratorDuoStroke
