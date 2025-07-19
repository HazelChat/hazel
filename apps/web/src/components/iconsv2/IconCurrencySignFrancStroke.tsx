// stroke/money-&-payments
import type { Component, JSX } from "solid-js"

export const IconCurrencySignFrancStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16.5 4h-5.643c-.798 0-1.197 0-1.518.112A2 2 0 0 0 8.112 5.34C8 5.66 8 6.06 8 6.857V12m7.5 0H8m0 0H5m3 0v4m-3 0h3m0 0h4m-4 0v5"
				fill="none"
			/>
		</svg>
	)
}

export default IconCurrencySignFrancStroke
