// contrast/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconWalletLink1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.38 10.087C2 11.005 2 12.17 2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706c.86.356 1.934.38 3.976.38v-.126A6 6 0 0 1 14.998 14h4.004c.915 0 1.78.205 2.556.57H22v-.07c0-2.33 0-3.495-.38-4.413a5 5 0 0 0-2.707-2.706A4 4 0 0 0 18 7.13C17.195 7 16.134 7 14.5 7h-5c-2.33 0-3.495 0-4.413.38a5 5 0 0 0-2.706 2.707Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 14.5V11c0-2.8 0-4.2.545-5.27A5 5 0 0 1 4.73 3.545C5.8 3 7.2 3 10 3h3.5c1.398 0 2.097 0 2.648.228a3 3 0 0 1 1.624 1.624c.207.5.226 1.123.228 2.28M2 14.5c0 1.33 0 2.495.38 3.413a5 5 0 0 0 2.707 2.706c.707.293 1.56.36 2.978.376M2 14.5c0-2.33 0-3.495.38-4.413A5 5 0 0 1 5.088 7.38C6.005 7 7.17 7 9.5 7h5c1.634 0 2.695 0 3.5.131m0 0c.343.056.639.136.913.25a5 5 0 0 1 2.706 2.706c.333.803.375 1.793.38 3.585M18.965 17h.037A3 3 0 0 1 22 20c0 1.657-1.342 3-2.998 3h-.037m-3.93-6h-.037A3 3 0 0 0 12 20c0 1.657 1.342 3 2.998 3h.037m.962-3h1.999M14 12h3"
			/>
		</svg>
	)
}

export default IconWalletLink1
