// duo-solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGaugeRightDownDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="currentColor"
				fill-rule="evenodd"
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M16.075 17.001a1 1 0 0 1-.67-.197l-4.624-3.47a1.824 1.824 0 1 1 2.554-2.553l3.47 4.623a1 1 0 0 1-.73 1.597Z"
			/>
		</svg>
	)
}

export default IconGaugeRightDownDuoSolid
