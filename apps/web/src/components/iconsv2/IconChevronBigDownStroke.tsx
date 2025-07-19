// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconChevronBigDownStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 9a30.6 30.6 0 0 0 5.49 5.817c.3.244.72.244 1.02 0A30.6 30.6 0 0 0 18 9"
				fill="none"
			/>
		</svg>
	)
}

export default IconChevronBigDownStroke
