// duo-stroke/weather
import type { Component, JSX } from "solid-js"

export const IconWaterTripleDropletDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 2.056c6.262 5.703 2.752 9.333 0 9.333s-6.262-3.63 0-9.333Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 12.266C12.262 17.97 8.752 21.6 6 21.6s-6.262-3.63 0-9.333Zm12 0c6.262 5.703 2.752 9.333 0 9.333s-6.262-3.63 0-9.333Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconWaterTripleDropletDuoStroke
