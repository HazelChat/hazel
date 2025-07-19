// duo-solid/appliances
import type { Component, JSX } from "solid-js"

export const IconFloorLampOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 21V10M9 21h6"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M9.829 2A3 3 0 0 0 6.99 4.027L5.054 9.676A1 1 0 0 0 6 11h12a1 1 0 0 0 .946-1.324l-1.937-5.649A3 3 0 0 0 14.171 2z"
			/>
		</svg>
	)
}

export default IconFloorLampOffDuoSolid
