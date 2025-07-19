// stroke/general
import type { Component, JSX } from "solid-js"

export const IconListTextWrapStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 12h13a3 3 0 1 1 0 6h-6m-7 0h2.5M4 6h16m-6.188 15a15 15 0 0 1-2.655-2.556A.7.7 0 0 1 11 18m2.812-3a15 15 0 0 0-2.655 2.556A.7.7 0 0 0 11 18"
				fill="none"
			/>
		</svg>
	)
}

export default IconListTextWrapStroke
