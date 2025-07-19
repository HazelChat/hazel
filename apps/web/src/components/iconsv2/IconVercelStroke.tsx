// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconVercelStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-width="2"
				d="M11.138 3.466a1 1 0 0 1 1.724 0l8.251 14.027A1 1 0 0 1 20.252 19H3.747a1 1 0 0 1-.862-1.507z"
				fill="none"
			/>
		</svg>
	)
}

export default IconVercelStroke
