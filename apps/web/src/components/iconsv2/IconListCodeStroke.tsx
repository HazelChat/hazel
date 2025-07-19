// stroke/general
import type { Component, JSX } from "solid-js"

export const IconListCodeStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 12h6m-6 6h6M4 6h16m-1.286 11.272a11.6 11.6 0 0 0 2.226-2.116.27.27 0 0 0 0-.34 11.6 11.6 0 0 0-2.226-2.116m-3.428 0a11.6 11.6 0 0 0-2.226 2.116.27.27 0 0 0 0 .34c.642.797 1.39 1.509 2.226 2.116"
				fill="none"
			/>
		</svg>
	)
}

export default IconListCodeStroke
