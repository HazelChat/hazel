// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconWalletconnectDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.769 8.846A8.23 8.23 0 0 1 11.999 6a8.23 8.23 0 0 1 6.232 2.846"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m2 12.111 5 5.625 5-5.625 5 5.625 5-5.625"
				fill="none"
			/>
		</svg>
	)
}

export default IconWalletconnectDuoStroke
