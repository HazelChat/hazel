// stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMaximizeTwoArrowStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 6.289a20.8 20.8 0 0 1 5.347-.202.625.625 0 0 1 .566.566A20.8 20.8 0 0 1 17.71 12M12 17.711a20.8 20.8 0 0 1-5.347.202.624.624 0 0 1-.566-.566A20.8 20.8 0 0 1 6.29 12"
				fill="none"
			/>
		</svg>
	)
}

export default IconMaximizeTwoArrowStroke
