// duo-solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGaugeRightUpDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 22.15C6.394 22.15 1.85 17.606 1.85 12 1.85 6.395 6.394 1.85 12 1.85S22.15 6.395 22.15 12 17.606 22.15 12 22.15Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M16.075 6.999a1 1 0 0 0-.67.197l-4.624 3.47a1.826 1.826 0 1 0 2.554 2.553l3.47-4.623A1 1 0 0 0 16.074 7Z"
			/>
		</svg>
	)
}

export default IconGaugeRightUpDuoSolid
