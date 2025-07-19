// stroke/general
import type { Component, JSX } from "solid-js"

export const IconFireplaceStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 21h2m0 0V7m0 14h14M5 7h-.5A1.5 1.5 0 0 1 3 5.5v-1A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5v1A1.5 1.5 0 0 1 19.5 7H19M5 7h14m0 14h2m-2 0V7m-8 6.808c.82 0 1.34-1.514 1.616-2.808.94.57 2.384 2.09 2.384 3.84 0 1.483-1 2.967-3 2.967s-3-1.483-3-2.967c0-.885.369-1.71.855-2.385A12 12 0 0 0 11 13.808Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFireplaceStroke
