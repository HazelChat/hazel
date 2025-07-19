// solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGaugeRightUp: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M1.85 12c0 5.606 4.544 10.15 10.15 10.15S22.15 17.606 22.15 12c0-5.605-4.544-10.15-10.15-10.15S1.85 6.395 1.85 12Zm13.554-4.804a1 1 0 0 1 1.4 1.4l-3.469 4.623a1.825 1.825 0 1 1-2.554-2.554z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconGaugeRightUp
