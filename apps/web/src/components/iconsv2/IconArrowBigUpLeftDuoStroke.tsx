// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigUpLeftDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M14.809 4.91a61 61 0 0 0-3.062 2.594l7.017 7.017c.396.396.594.594.668.822a1 1 0 0 1 0 .618c-.074.228-.272.426-.668.822l-1.98 1.98c-.396.396-.594.595-.823.669a1 1 0 0 1-.618 0c-.228-.074-.426-.272-.822-.669l-7.017-7.016a61 61 0 0 0-2.595 3.062"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.809 4.91a35.3 35.3 0 0 0-9.097-.178 1.11 1.11 0 0 0-.98.98 35.3 35.3 0 0 0 .177 9.097"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigUpLeftDuoStroke
