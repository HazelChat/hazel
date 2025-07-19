// duo-stroke/automotive
import type { Component, JSX } from "solid-js"

export const IconAirplaneLiftoffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 20h18"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m7.572 15.516 13.367-3.581a1 1 0 0 0 .707-1.225 3 3 0 0 0-3.674-2.121l-2.898.776-7.701-5.157a3 3 0 0 0-2.445-.406l-.618.165 4.968 6.951-2.897.777-3.129-1.059a1 1 0 0 0-.58-.018l-.673.18 2.294 3.474a3 3 0 0 0 3.28 1.244Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAirplaneLiftoffDuoStroke
