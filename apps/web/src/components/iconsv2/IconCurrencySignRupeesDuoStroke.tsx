// duo-stroke/money-&-payments
import type { Component, JSX } from "solid-js"

export const IconCurrencySignRupeesDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 9h14"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 4h6.02m0 0H19m-7.98 0a5 5 0 1 1 0 10H5.5l9.5 7"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignRupeesDuoStroke
