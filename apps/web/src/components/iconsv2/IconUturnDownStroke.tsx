// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconUturnDownStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3.917 15.97a20.8 20.8 0 0 0 3.679 3.885A.64.64 0 0 0 8 20m4.083-4.03a20.8 20.8 0 0 1-3.678 3.885A.64.64 0 0 1 8 20m0 0V9a5 5 0 0 1 10 0v3"
				fill="none"
			/>
		</svg>
	)
}

export default IconUturnDownStroke
