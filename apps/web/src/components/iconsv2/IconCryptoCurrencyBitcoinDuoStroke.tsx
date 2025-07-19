// duo-stroke/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconCryptoCurrencyBitcoinDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13 22v-2m0-16V2M9 22v-2M9 4V2"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.222 4H13a4 4 0 0 1 0 8H9.222c-.206 0-.31 0-.396-.008a2 2 0 0 1-1.818-1.818C7 10.087 7 9.984 7 9.778V6.222c0-.206 0-.31.008-.396A2 2 0 0 1 9 4m.222 0H9m.222 0H9m1.2 16H15a4 4 0 0 0 0-8h-4.8c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C7 13.52 7 14.08 7 15.2v1.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C8.52 20 9.08 20 10.2 20Zm0 0H7M7 4v16M7 4H5m2 0h2M5 20h2"
				fill="none"
			/>
		</svg>
	)
}

export default IconCryptoCurrencyBitcoinDuoStroke
