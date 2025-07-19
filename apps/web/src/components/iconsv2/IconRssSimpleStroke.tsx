// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconRssSimpleStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 4a16 16 0 0 1 16 16M4 11.579A8.42 8.42 0 0 1 12.421 20m-8.011-.421h.011"
				fill="none"
			/>
		</svg>
	)
}

export default IconRssSimpleStroke
