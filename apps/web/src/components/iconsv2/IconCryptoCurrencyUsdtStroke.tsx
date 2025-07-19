// stroke/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconCryptoCurrencyUsdtStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 5h7m0 0h7m-7 0v6m0 3v5m0-5c4.97 0 10-1.12 10-2.5S16.97 9 12 9 2 10.12 2 11.5 7.03 14 12 14Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCryptoCurrencyUsdtStroke
