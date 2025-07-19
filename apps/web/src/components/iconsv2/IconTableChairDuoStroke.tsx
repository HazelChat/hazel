// duo-stroke/building
import type { Component, JSX } from "solid-js"

export const IconTableChairDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 19v-6.043m0 0V5m0 7.957h3a2 2 0 0 1 2 2V19"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 19v-6.043m0 0V5m0 7.957h-3a2 2 0 0 0-2 2V19"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 19V9m0 0H7m5 0h5"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconTableChairDuoStroke
