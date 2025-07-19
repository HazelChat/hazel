// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconChevronBigUpStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 15a30.6 30.6 0 0 1 5.49-5.817.8.8 0 0 1 1.02 0A30.6 30.6 0 0 1 18 15"
				fill="none"
			/>
		</svg>
	)
}

export default IconChevronBigUpStroke
