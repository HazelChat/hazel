// duo-stroke/appliances
import type { Component, JSX } from "solid-js"

export const IconFloorLampOffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 21V10M9 21h6"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7.937 4.351A2 2 0 0 1 9.829 3h4.342a2 2 0 0 1 1.892 1.351L18 10H6z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFloorLampOffDuoStroke
