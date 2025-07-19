// duo-stroke/devices
import type { Component, JSX } from "solid-js"

export const IconWifiOffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 19.5h.01M1.193 8.7A15.94 15.94 0 0 1 12 4.5c2.213 0 4.321.45 6.238 1.262M4.732 12.243A10.96 10.96 0 0 1 12 9.5c.777 0 1.535.08 2.266.234M14.402 15a6 6 0 0 1 1.296.775m5.96-8.032q.597.453 1.148.958m-4.732 2.627q.63.418 1.194.915"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3.385 20.615 21 3"
				fill="none"
			/>
		</svg>
	)
}

export default IconWifiOffDuoStroke
