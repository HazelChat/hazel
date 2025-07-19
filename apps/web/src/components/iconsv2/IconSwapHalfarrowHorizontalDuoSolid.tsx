// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconSwapHalfarrowHorizontalDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17.344 10H6m.656 4H18"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M16.63 5.124a1 1 0 0 1 1.078.072 21.2 21.2 0 0 1 3.933 3.783c.238.297.359.659.359 1.021a1 1 0 0 1-1 1h-3.656a1 1 0 0 1-1-1q0-.852-.063-1.703l-.165-2.223a1 1 0 0 1 .514-.95Z"
			/>
			<path
				fill="currentColor"
				d="M7.37 18.876a1 1 0 0 1-1.078-.072 21.2 21.2 0 0 1-3.933-3.783A1.63 1.63 0 0 1 2 14a1 1 0 0 1 1-1h3.656a1 1 0 0 1 1 1q0 .852.063 1.703l.165 2.223a1 1 0 0 1-.514.95Z"
			/>
		</svg>
	)
}

export default IconSwapHalfarrowHorizontalDuoSolid
