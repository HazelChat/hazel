// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowBigDownRightDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.191 19.091a61 61 0 0 0 3.062-2.595L5.236 9.48c-.396-.396-.594-.594-.668-.822a1 1 0 0 1 0-.618c.074-.228.272-.426.668-.822l1.98-1.98c.396-.396.594-.594.823-.669a1 1 0 0 1 .618 0c.228.075.426.273.822.669l7.017 7.017A61 61 0 0 0 19.09 9.19"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.191 19.09a35.3 35.3 0 0 0 9.097.178 1.11 1.11 0 0 0 .98-.98 35.3 35.3 0 0 0-.177-9.097"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigDownRightDuoStroke
