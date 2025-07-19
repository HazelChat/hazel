// duo-stroke/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconCryptoCurrencyUsdtDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 11.5c0 1.38-5.03 2.5-10 2.5S2 12.88 2 11.5 7.03 9 12 9s10 1.12 10 2.5Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M5 4a1 1 0 0 0 0 2h6v5a1 1 0 1 0 2 0V6h6a1 1 0 1 0 0-2z" />
			<path fill="currentColor" d="M13 14.986a35 35 0 0 1-2 0V19a1 1 0 1 0 2 0z" />
		</svg>
	)
}

export default IconCryptoCurrencyUsdtDuoStroke
