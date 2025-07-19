// stroke/money-&-payments
import type { Component, JSX } from "solid-js"

export const IconCurrencySignRupeesStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 4h6.02m0 0H19m-7.98 0a5 5 0 0 1 5 4.98V9M15 21l-9.5-7h5.52a5 5 0 0 0 5-5m0 0H5m11.02 0H19"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignRupeesStroke
