// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigUpLeftStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m18.764 16.784-1.98 1.98c-.396.396-.594.594-.823.668a1 1 0 0 1-.618 0c-.228-.074-.426-.272-.822-.668l-7.017-7.017A61 61 0 0 0 4.91 14.81a35.3 35.3 0 0 1-.177-9.096 1.11 1.11 0 0 1 .98-.98 35.3 35.3 0 0 1 9.097.177 61 61 0 0 0-3.062 2.594l7.017 7.017c.396.396.594.594.668.823a1 1 0 0 1 0 .618c-.074.228-.272.426-.668.822Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigUpLeftStroke
