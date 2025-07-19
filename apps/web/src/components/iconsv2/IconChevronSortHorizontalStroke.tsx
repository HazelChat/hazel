// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconChevronSortHorizontalStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596A20.4 20.4 0 0 0 15 8M9 8a20.4 20.4 0 0 0-3.894 3.702.47.47 0 0 0 0 .596A20.4 20.4 0 0 0 9 16"
				fill="none"
			/>
		</svg>
	)
}

export default IconChevronSortHorizontalStroke
