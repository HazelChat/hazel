// contrast/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconWalletArrowDown1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.38 10.087C2 11.005 2 12.17 2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706C6.005 21 7.17 21 9.5 21h5.121v-.348A3 3 0 0 1 17 16.622v-.62a3 3 0 0 1 4.484-2.608h.514c-.01-1.618-.064-2.547-.379-3.307a5 5 0 0 0-2.706-2.706A4 4 0 0 0 18 7.13C17.195 7 16.134 7 14.5 7h-5c-2.33 0-3.495 0-4.413.38a5 5 0 0 0-2.706 2.707Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 14.5V11c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 3.545C5.8 3 7.2 3 10 3h3.5c1.398 0 2.097 0 2.648.228a3 3 0 0 1 1.624 1.624c.207.5.226 1.123.228 2.28M2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706C6.005 21 7.17 21 9.5 21h4.184M2 14.5c0-2.33 0-3.495.38-4.413A5 5 0 0 1 5.088 7.38C6.005 7 7.17 7 9.5 7h5c1.634 0 2.695 0 3.5.131M14 12h3m1-4.869c.343.056.639.136.913.25a5 5 0 0 1 2.706 2.706c.255.615.34 1.34.367 2.451m-4.558 7.054c.635.846 1.371 1.61 2.192 2.275a.6.6 0 0 0 .38.135m2.571-2.41a13 13 0 0 1-2.19 2.275.6.6 0 0 1-.381.135m0 0v-6"
			/>
		</svg>
	)
}

export default IconWalletArrowDown1
