// duo-solid/food
import type { Component, JSX } from "solid-js"

export const IconWineGlassEmptyDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 13v9m0 0h4m-4 0H8"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M7.302 1a1 1 0 0 0-.868.502A11 11 0 0 0 5 6.89C5 10.767 7.8 14 12 14s7-3.233 7-7.111c0-1.914-.535-3.82-1.434-5.387A1 1 0 0 0 16.698 1z"
			/>
		</svg>
	)
}

export default IconWineGlassEmptyDuoSolid
