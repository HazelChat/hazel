// stroke/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconPiechartRingStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 21.15a9.15 9.15 0 0 0 6.698-15.384M12 21.15V15m0 6.15A9.15 9.15 0 0 1 2.85 12m0 0a9.15 9.15 0 0 1 15.848-6.234M2.85 12H9m3 3a3 3 0 0 0 2.34-4.876M12 15a3 3 0 0 1-3-3m0 0a3 3 0 0 1 5.34-1.876m0 0 4.358-4.358"
				fill="none"
			/>
		</svg>
	)
}

export default IconPiechartRingStroke
