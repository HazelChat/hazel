// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconTrezorWalletStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M8 9V7a4 4 0 1 1 8 0v2M6 10.5v6.6a1.5 1.5 0 0 0 .794 1.324l4.5 2.402a1.5 1.5 0 0 0 1.412 0l4.5-2.402A1.5 1.5 0 0 0 18 17.1v-6.6A1.5 1.5 0 0 0 16.5 9h-9A1.5 1.5 0 0 0 6 10.5Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconTrezorWalletStroke
