// contrast/weather
import type { Component, JSX } from "solid-js"

export const IconWaterDroplet1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 3c13 11 5.712 18 0 18s-13-7 0-18Z"
			/>
			<path fill="currentColor" d="M12 3c13 11 5.712 18 0 18s-13-7 0-18Z" opacity=".28" />
		</svg>
	)
}

export default IconWaterDroplet1
