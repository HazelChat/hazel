// duo-stroke/building
import type { Component, JSX } from "solid-js"

export const IconBuildingHotelDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke-miterlimit="16"
				stroke-width="2"
				d="M19 4.19V19.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5V4.19m14 0a14.67 14.67 0 0 0-14 0m14 0c.692.377 1.362.814 2 1.31M5 4.19q-1.041.567-2 1.31"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-miterlimit="16"
				stroke-width="2"
				d="M10 21v-4.435M14 21v-4.435m.829.636a4 4 0 0 0-.83-.636m-4.827.636a4 4 0 0 1 .828-.636m4 0a4 4 0 0 0-4 0M8 7v.01M8 10v.01M8 13v.01M12 7v.01M12 10v.01M12 13v.01M16 7v.01M16 10v.01M16 13v.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconBuildingHotelDuoStroke
