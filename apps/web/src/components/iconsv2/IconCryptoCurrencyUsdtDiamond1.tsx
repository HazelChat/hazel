// contrast/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconCryptoCurrencyUsdtDiamond1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="M16.592 4H7.408c-.854 0-1.651.427-2.125 1.137L2.43 9.418a2.554 2.554 0 0 0 .31 3.213l7.445 7.529c1 1.01 2.632 1.01 3.632 0l7.446-7.53a2.554 2.554 0 0 0 .31-3.212l-2.855-4.28A2.55 2.55 0 0 0 16.592 4Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8.425 8H12m0 0h3.575M12 8v3m0 3c2.761 0 5-.672 5-1.5S14.761 11 12 11m0 3c-2.761 0-5-.672-5-1.5S9.239 11 12 11m0 3v3m0-6v.5M7.408 4h9.184c.854 0 1.651.427 2.125 1.137l2.854 4.281a2.554 2.554 0 0 1-.31 3.213l-7.445 7.529a2.554 2.554 0 0 1-3.632 0l-7.446-7.53a2.554 2.554 0 0 1-.31-3.212l2.855-4.28A2.55 2.55 0 0 1 7.408 4Z"
			/>
		</svg>
	)
}

export default IconCryptoCurrencyUsdtDiamond1
