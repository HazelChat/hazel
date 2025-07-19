// duo-stroke/devices
import type { Component, JSX } from "solid-js"

export const IconVideoCallOffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13 5H6a4 4 0 0 0-4 4v6c0 1.9 1.325 3.49 3.101 3.899M17 12v1.868a2 2 0 0 0 .714 1.531l1 .84c1.3 1.093 3.286.168 3.286-1.531V9.292c0-1.7-1.985-2.624-3.286-1.531l-1 .84A2 2 0 0 0 17 10.132zm0 0V9c0-.587-.126-1.144-.354-1.646M17 12v3a4 4 0 0 1-4 4h-3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M2 22 22 2"
				fill="none"
			/>
		</svg>
	)
}

export default IconVideoCallOffDuoStroke
