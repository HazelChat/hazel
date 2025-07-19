// stroke/general
import type { Component, JSX } from "solid-js"

export const IconCampFireStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2 21 12 5.167m0 0L14 2m-2 3.167L22 21M12 5.167 10 2m1 15c.593 0 1.34-1.514 1.616-2.808.94.57 2.384 2.09 2.384 3.84C15 19.516 14 21 12 21s-3-1.483-3-2.967c0-.884.369-1.71.855-2.385C10.324 16.314 11 17 11 17Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCampFireStroke
