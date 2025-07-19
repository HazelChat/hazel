// duo-stroke/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconCryptoCurrencyPolygonDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-miterlimit="10"
				stroke-width="2"
				d="M12 7.487v-.82L7.5 4 3 6.667V12l4.5 2.667 9-5.334L21 12v5.333L16.5 20 12 17.333v-.871"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-miterlimit="10"
				stroke-width="2"
				d="M3 12V6.667L7.5 4 12 6.667v.82M21 12v5.333L16.5 20 12 17.333v-.871"
				fill="none"
			/>
		</svg>
	)
}

export default IconCryptoCurrencyPolygonDuoStroke
