// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconSwapArrowVerticalStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 17.113a20.2 20.2 0 0 0 3.604 3.747c.116.093.256.14.396.14m4-3.887a20.2 20.2 0 0 1-3.604 3.747A.63.63 0 0 1 16 21m0 0V7M4 6.887A20.2 20.2 0 0 1 7.604 3.14.63.63 0 0 1 8 3m4 3.887A20.2 20.2 0 0 0 8.396 3.14.63.63 0 0 0 8 3m0 0v14"
				fill="none"
			/>
		</svg>
	)
}

export default IconSwapArrowVerticalStroke
