// stroke/general
import type { Component, JSX } from "solid-js"

export const IconListNumberStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 10V4.755C4.324 4.92 3.807 5.386 3.5 6M7 19H3.608v-.5c.882-.618 1.786-1.201 2.51-2.011.482-.541.536-1.351.015-1.895-.423-.441-1.154-.586-1.717-.367-.38.148-.597.444-.808.773M21 6H11m10 6H11m10 6H11"
				fill="none"
			/>
		</svg>
	)
}

export default IconListNumberStroke
