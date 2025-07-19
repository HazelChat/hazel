// stroke/security
import type { Component, JSX } from "solid-js"

export const IconKeyRightStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm0 0h12v3m-4-3v2"
				fill="none"
			/>
		</svg>
	)
}

export default IconKeyRightStroke
