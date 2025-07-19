// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconDeleteBackwardLeftDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.206 11.307a33 33 0 0 1 4.42-5.287c.357-.345.536-.518.784-.667.207-.123.476-.232.71-.287C8.402 5 8.681 5 9.24 5H17c1.4 0 2.1 0 2.635.272a2.5 2.5 0 0 1 1.092 1.093C21 6.9 21 7.6 21 9v6c0 1.4 0 2.1-.273 2.635a2.5 2.5 0 0 1-1.092 1.092C19.1 19 18.4 19 17 19H9.239c-.558 0-.837 0-1.119-.066a2.7 2.7 0 0 1-.71-.287c-.248-.148-.427-.321-.785-.667a33 33 0 0 1-4.419-5.287A1.24 1.24 0 0 1 2 12c0-.245.069-.49.206-.693Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m16 15-3-3m0 0-3-3m3 3 3-3m-3 3-3 3"
				fill="none"
			/>
		</svg>
	)
}

export default IconDeleteBackwardLeftDuoStroke
