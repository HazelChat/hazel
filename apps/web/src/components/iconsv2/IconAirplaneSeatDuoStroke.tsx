// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconAirplaneSeatDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m6.837 8.635 3.53 6.114a2 2 0 0 0 2.732.732l2.494-1.44a1 1 0 0 1 1.283.244l3.427 4.307"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7.837 4.646a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m15.236 17.492-1.262.652a4.5 4.5 0 0 1-5.962-1.749L4.33 10.018"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2z"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconAirplaneSeatDuoStroke
