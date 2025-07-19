// stroke/general
import type { Component, JSX } from "solid-js"

export const IconFilterHorizontalStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 7h7m0 0a3 3 0 0 0 3 3h1a3 3 0 1 0 0-6h-1a3 3 0 0 0-3 3Zm6 10h5M20 7h1M3 17h3m0 0a3 3 0 0 0 3 3h1a3 3 0 1 0 0-6H9a3 3 0 0 0-3 3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFilterHorizontalStroke
