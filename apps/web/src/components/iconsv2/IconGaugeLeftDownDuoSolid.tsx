// duo-solid/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconGaugeLeftDownDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7 16.075a1 1 0 0 1 .197-.671l3.468-4.623a1.826 1.826 0 1 1 2.555 2.555l-4.623 3.468A1 1 0 0 1 7 16.074Z"
			/>
		</svg>
	)
}

export default IconGaugeLeftDownDuoSolid
