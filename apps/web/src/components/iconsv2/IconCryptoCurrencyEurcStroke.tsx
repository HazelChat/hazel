// stroke/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconCryptoCurrencyEurcStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.5 20.457A9.15 9.15 0 0 1 2.85 12 9.15 9.15 0 0 1 8.5 3.543m7 0A9.15 9.15 0 0 1 21.15 12a9.15 9.15 0 0 1-5.65 8.456m-.584-12.672a4.36 4.36 0 0 0-2.5-.784c-2.28 0-4.116 1.772-4.363 4m6.863 5.216A4.377 4.377 0 0 1 8.26 14m0 0H7m1.261 0H11m-2.74 0c-.314-.949-.316-2.019-.208-3M7 11h1.053m0 0H12"
				fill="none"
			/>
		</svg>
	)
}

export default IconCryptoCurrencyEurcStroke
