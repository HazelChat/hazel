// stroke/general
import type { Component, JSX } from "solid-js"

export const IconListRemoveStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 12h6m-6 6h6M4 6h16m-6 9h6"
				fill="none"
			/>
		</svg>
	)
}

export default IconListRemoveStroke
