// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigDownLeftStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m18.764 7.217-1.98-1.98c-.396-.396-.594-.594-.823-.669a1 1 0 0 0-.618 0c-.228.075-.426.273-.822.669l-7.017 7.017A61 61 0 0 1 4.91 9.19a35.3 35.3 0 0 0-.177 9.097 1.11 1.11 0 0 0 .98.98 35.3 35.3 0 0 0 9.097-.177 61 61 0 0 1-3.062-2.595l7.017-7.017c.396-.396.594-.594.668-.822a1 1 0 0 0 0-.618c-.074-.228-.272-.426-.668-.822Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigDownLeftStroke
