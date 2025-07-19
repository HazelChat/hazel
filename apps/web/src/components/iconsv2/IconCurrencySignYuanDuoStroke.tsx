// duo-stroke/money-&-payments
import type { Component, JSX } from "solid-js"

export const IconCurrencySignYuanDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 12h12M6 16h12"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m5 3 7 8.1m0 0L19 3m-7 8.1V21"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignYuanDuoStroke
