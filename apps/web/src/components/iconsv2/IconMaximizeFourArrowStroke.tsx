// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMaximizeFourArrowStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.333 19.744a18.5 18.5 0 0 1-4.753.179.555.555 0 0 1-.503-.503 18.5 18.5 0 0 1 .18-4.753m10.41 5.077c1.58.264 3.178.324 4.753.179a.555.555 0 0 0 .503-.503 18.5 18.5 0 0 0-.18-4.753M4.258 9.333a18.5 18.5 0 0 1-.18-4.753.555.555 0 0 1 .503-.503 18.5 18.5 0 0 1 4.753.18m5.334 0a18.5 18.5 0 0 1 4.753-.18.555.555 0 0 1 .503.503 18.5 18.5 0 0 1-.18 4.753"
				fill="none"
			/>
		</svg>
	)
}

export default IconMaximizeFourArrowStroke
