// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconSwapHalfarrowVerticalStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M18 17.113a20.2 20.2 0 0 1-3.604 3.747A.63.63 0 0 1 14 21V6m-8 .887A20.2 20.2 0 0 1 9.604 3.14.63.63 0 0 1 10 3v15"
				fill="none"
			/>
		</svg>
	)
}

export default IconSwapHalfarrowVerticalStroke
