// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigDownLeft1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				d="m16.783 5.236 1.98 1.98c.396.396.594.594.668.822a1 1 0 0 1 0 .618c-.074.23-.272.427-.668.823l-7.017 7.017a61 61 0 0 0 3.062 2.595 35.3 35.3 0 0 1-9.096.177 1.11 1.11 0 0 1-.98-.98 35.2 35.2 0 0 1 .177-9.097 61 61 0 0 0 2.595 3.063l7.016-7.018c.396-.396.594-.594.823-.668a1 1 0 0 1 .618 0c.228.074.426.272.822.668Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m18.764 7.217-1.98-1.98c-.396-.396-.594-.594-.822-.669a1 1 0 0 0-.618 0c-.229.075-.427.273-.823.669l-7.017 7.017A61 61 0 0 1 4.91 9.19a35.3 35.3 0 0 0-.178 9.097 1.11 1.11 0 0 0 .98.98 35.3 35.3 0 0 0 9.097-.177 61 61 0 0 1-3.062-2.595l7.017-7.017c.396-.396.594-.594.668-.822a1 1 0 0 0 0-.618c-.074-.228-.272-.426-.668-.822Z"
			/>
		</svg>
	)
}

export default IconArrowBigDownLeft1
