// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconTrezorWalletDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 17.1v-6.6A1.5 1.5 0 0 1 7.5 9h9a1.5 1.5 0 0 1 1.5 1.5v6.6a1.5 1.5 0 0 1-.794 1.324l-4.5 2.402a1.5 1.5 0 0 1-1.412 0l-4.5-2.402A1.5 1.5 0 0 1 6 17.1Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M9 7a3 3 0 1 1 6 0v1h1.5q.257 0 .5.05V7A5 5 0 0 0 7 7v1.05Q7.243 8 7.5 8H9z"
			/>
		</svg>
	)
}

export default IconTrezorWalletDuoStroke
