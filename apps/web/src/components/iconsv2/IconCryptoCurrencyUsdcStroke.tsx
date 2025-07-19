// stroke/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconCryptoCurrencyUsdcStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8.5 20.457A9.15 9.15 0 0 1 2.85 12 9.15 9.15 0 0 1 8.5 3.543m7 0A9.15 9.15 0 0 1 21.15 12a9.15 9.15 0 0 1-5.65 8.457M12 6v1.2m0 0V12m0-4.8h-1.111c-1.228 0-2.223 1.074-2.223 2.4S9.661 12 10.89 12H12m0-4.8h1.182c1.035 0 1.905.765 2.152 1.8M12 12v4.8m0-4.8h1.11c1.228 0 2.223 1.075 2.223 2.4s-.995 2.4-2.222 2.4H12m0 0V18m0-1.2h-1.181c-1.036 0-1.906-.765-2.153-1.8"
				fill="none"
			/>
		</svg>
	)
}

export default IconCryptoCurrencyUsdcStroke
