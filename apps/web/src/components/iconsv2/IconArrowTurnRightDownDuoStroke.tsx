// duo-stroke/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowTurnRightDownDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 20v-8c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C11.2 4 9.8 4 7 4H4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 15.142a25.2 25.2 0 0 1-4.505 4.684.79.79 0 0 1-.99 0A25.2 25.2 0 0 1 10 15.142"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowTurnRightDownDuoStroke
