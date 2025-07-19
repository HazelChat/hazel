// stroke/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconWalletArrowUpStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14 12h3m.428 6.412a13 13 0 0 1 2.192-2.275.6.6 0 0 1 .38-.135m2.571 2.41a13 13 0 0 0-2.19-2.275.6.6 0 0 0-.381-.135m0 0v6M2 14.5V11c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 3.545C5.8 3 7.2 3 10 3h3.5c1.398 0 2.097 0 2.648.228a3 3 0 0 1 1.624 1.624c.207.5.226 1.123.228 2.28M2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706C6.005 21 7.17 21 9.5 21h4.88M2 14.5c0-2.33 0-3.495.38-4.413A5 5 0 0 1 5.088 7.38C6.005 7 7.17 7 9.5 7h5c1.634 0 2.695 0 3.5.131m0 0c.343.056.639.136.913.25a5 5 0 0 1 2.706 2.706c.249.599.335 1.303.365 2.367"
				fill="none"
			/>
		</svg>
	)
}

export default IconWalletArrowUpStroke
