// duo-stroke/food
import type { Component, JSX } from "solid-js"

export const IconWineGlassBrokenDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 13v9m0 0h4m-4 0H8m3.13-13.994c-.63-.615-.997-1.406-1.138-2.268l1.714-1.155A6.2 6.2 0 0 0 10.493 2"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 13c3.6 0 6-2.736 6-6.111A10 10 0 0 0 16.698 2H7.302A10 10 0 0 0 6 6.889C6 10.264 8.4 13 12 13Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconWineGlassBrokenDuoStroke
