// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconSwapHalfarrowHorizontalStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6.887 18a20.2 20.2 0 0 1-3.747-3.604A.63.63 0 0 1 3 14h15m-.887-8a20.2 20.2 0 0 1 3.747 3.604c.093.116.14.256.14.396H6"
				fill="none"
			/>
		</svg>
	)
}

export default IconSwapHalfarrowHorizontalStroke
