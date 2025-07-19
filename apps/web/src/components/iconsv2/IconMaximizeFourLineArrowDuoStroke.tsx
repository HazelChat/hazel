// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMaximizeFourLineArrowDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.778 20.778 15 15M3.222 3.222 9 9M3.222 20.778 9 15M20.778 3.222 15 9"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16 20.76a17.3 17.3 0 0 0 4.456.167.52.52 0 0 0 .471-.471A17.3 17.3 0 0 0 20.759 16M8 3.24a17.3 17.3 0 0 0-4.456-.167.52.52 0 0 0-.471.471A17.3 17.3 0 0 0 3.24 8M8 20.76a17.3 17.3 0 0 1-4.456.167.52.52 0 0 1-.471-.471A17.3 17.3 0 0 1 3.24 16M16 3.24a17.3 17.3 0 0 1 4.456-.167.52.52 0 0 1 .471.471A17.3 17.3 0 0 1 20.759 8"
				fill="none"
			/>
		</svg>
	)
}

export default IconMaximizeFourLineArrowDuoStroke
